import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управляет маркетом - получение списка, добавление и покупка предметов
    Args: event с httpMethod (GET для списка, POST для добавления/покупки)
    Returns: HTTP ответ со списком предметов или результатом операции
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
    
    # Получить список предметов на маркете
    if method == 'GET':
        cur.execute("""
            SELECT id, user_id, item_name, rarity, price, description, 
                   seller_username, created_at
            FROM market_items 
            WHERE is_sold = false 
            ORDER BY created_at DESC
        """)
        items = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'items': [dict(item) for item in items]}, default=str)
        }
    
    # Добавить или купить предмет
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        # Добавить предмет на маркет
        if action == 'add':
            user_id = body_data.get('user_id')
            item_id = body_data.get('item_id')
            price = body_data.get('price')
            description = body_data.get('description', '')
            
            if not user_id or not item_id or not price:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id, item_id и price обязательны'})
                }
            
            # Получаем предмет из инвентаря
            cur.execute(
                "SELECT item_name, rarity FROM inventory WHERE id = %s AND user_id = %s",
                (item_id, user_id)
            )
            item = cur.fetchone()
            
            if not item:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Предмет не найден'})
                }
            
            # Получаем username
            cur.execute("SELECT username FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            # Добавляем на маркет
            cur.execute("""
                INSERT INTO market_items 
                (user_id, item_name, rarity, price, description, seller_username)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, item['item_name'], item['rarity'], price, description, user['username']))
            
            market_item_id = cur.fetchone()['id']
            
            # Удаляем из инвентаря
            cur.execute("DELETE FROM inventory WHERE id = %s", (item_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'market_item_id': market_item_id, 'message': 'Предмет выставлен на продажу'})
            }
        
        # Купить предмет
        if action == 'buy':
            user_id = body_data.get('user_id')
            market_item_id = body_data.get('market_item_id')
            
            if not user_id or not market_item_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id и market_item_id обязательны'})
                }
            
            # Получаем информацию о предмете
            cur.execute("""
                SELECT user_id as seller_id, item_name, rarity, price, is_sold
                FROM market_items 
                WHERE id = %s
            """, (market_item_id,))
            market_item = cur.fetchone()
            
            if not market_item or market_item['is_sold']:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Предмет не найден или уже продан'})
                }
            
            if market_item['seller_id'] == user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нельзя купить свой предмет'})
                }
            
            # Проверяем баланс покупателя
            cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
            buyer = cur.fetchone()
            
            if not buyer or buyer['balance'] < market_item['price']:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недостаточно средств'})
                }
            
            # Списываем деньги у покупателя
            cur.execute(
                "UPDATE users SET balance = balance - %s WHERE id = %s",
                (market_item['price'], user_id)
            )
            
            # Начисляем деньги продавцу
            cur.execute(
                "UPDATE users SET balance = balance + %s WHERE id = %s",
                (market_item['price'], market_item['seller_id'])
            )
            
            # Добавляем предмет в инвентарь покупателя
            cur.execute(
                "INSERT INTO inventory (user_id, item_name, rarity) VALUES (%s, %s, %s)",
                (user_id, market_item['item_name'], market_item['rarity'])
            )
            
            # Помечаем предмет как проданный
            cur.execute(
                "UPDATE market_items SET is_sold = true WHERE id = %s",
                (market_item_id,)
            )
            
            # Записываем транзакции (если таблица существует)
            try:
                cur.execute(
                    "INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s)",
                    (user_id, -market_item['price'], 'market_purchase', f"Покупка: {market_item['item_name']}")
                )
                cur.execute(
                    "INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s)",
                    (market_item['seller_id'], market_item['price'], 'market_sale', f"Продажа: {market_item['item_name']}")
                )
            except:
                pass
            
            conn.commit()
            
            # Получаем новый баланс
            cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
            new_balance = cur.fetchone()['balance']
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Предмет успешно куплен', 'new_balance': new_balance})
            }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }