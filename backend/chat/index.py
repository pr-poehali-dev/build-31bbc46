import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управляет чатами - получение сообщений и отправка новых
    Args: event с httpMethod (GET для получения, POST для отправки)
    Returns: HTTP ответ со списком сообщений или подтверждением отправки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получить сообщения чата
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        market_item_id = params.get('market_item_id')
        
        if not market_item_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'market_item_id обязателен'})
            }
        
        cur.execute("""
            SELECT cm.id, cm.sender_id, cm.message, cm.created_at,
                   u.username as sender_username
            FROM chat_messages cm
            JOIN users u ON cm.sender_id = u.id
            WHERE cm.market_item_id = %s
            ORDER BY cm.created_at ASC
        """, (market_item_id,))
        
        messages = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'messages': [dict(msg) for msg in messages]}, default=str)
        }
    
    # Отправить сообщение
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        market_item_id = body_data.get('market_item_id')
        sender_id = body_data.get('sender_id')
        message = body_data.get('message')
        
        if not market_item_id or not sender_id or not message:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'market_item_id, sender_id и message обязательны'})
            }
        
        # Проверяем существование предмета
        cur.execute(
            "SELECT user_id FROM market_items WHERE id = %s",
            (market_item_id,)
        )
        market_item = cur.fetchone()
        
        if not market_item:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Предмет не найден'})
            }
        
        # Отправляем сообщение
        cur.execute("""
            INSERT INTO chat_messages (market_item_id, sender_id, message)
            VALUES (%s, %s, %s)
            RETURNING id, created_at
        """, (market_item_id, sender_id, message))
        
        result = cur.fetchone()
        
        # Получаем username отправителя
        cur.execute("SELECT username FROM users WHERE id = %s", (sender_id,))
        sender = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'message_id': result['id'],
                'created_at': str(result['created_at']),
                'sender_username': sender['username'],
                'message': 'Сообщение отправлено'
            })
        }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
