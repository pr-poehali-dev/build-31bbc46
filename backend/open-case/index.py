import json
import os
import random
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Открывает кейс, добавляет предмет в инвентарь и списывает баланс
    Args: event с httpMethod, body содержащим user_id и case_id
    Returns: HTTP ответ с выигранным предметом
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('user_id')
    case_id = body_data.get('case_id')
    
    if not user_id or not case_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id и case_id обязательны'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем информацию о кейсе
    cur.execute("SELECT * FROM cases WHERE id = %s AND is_active = true", (case_id,))
    case = cur.fetchone()
    
    if not case:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Кейс не найден'})
        }
    
    # Проверяем баланс пользователя
    cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    
    if not user or user['balance'] < case['price']:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно средств'})
        }
    
    # Определяем возможные предметы по редкости
    items_pool = {
        'Легендарный': [
            {'name': '🔥 Огненный меч', 'rarity': 'Легендарный'},
            {'name': '💎 Алмазная корона', 'rarity': 'Легендарный'},
            {'name': '⚡ Молния Зевса', 'rarity': 'Легендарный'}
        ],
        'Эпический': [
            {'name': '🗡️ Стальной клинок', 'rarity': 'Эпический'},
            {'name': '🛡️ Щит героя', 'rarity': 'Эпический'},
            {'name': '🏹 Эльфийский лук', 'rarity': 'Эпический'}
        ],
        'Редкий': [
            {'name': '⚔️ Железный меч', 'rarity': 'Редкий'},
            {'name': '🔮 Магический кристалл', 'rarity': 'Редкий'},
            {'name': '🪙 Золотая монета', 'rarity': 'Редкий'}
        ],
        'Обычный': [
            {'name': '🪨 Камень удачи', 'rarity': 'Обычный'},
            {'name': '🌿 Лечебная трава', 'rarity': 'Обычный'},
            {'name': '🍞 Хлеб', 'rarity': 'Обычный'}
        ]
    }
    
    # Шансы выпадения по редкости
    rarity_chances = {
        'Легендарный': 0.05,
        'Эпический': 0.15,
        'Редкий': 0.30,
        'Обычный': 0.50
    }
    
    # Выбираем редкость
    rand = random.random()
    cumulative = 0
    selected_rarity = 'Обычный'
    
    for rarity, chance in rarity_chances.items():
        cumulative += chance
        if rand <= cumulative:
            selected_rarity = rarity
            break
    
    # Выбираем случайный предмет выбранной редкости
    won_item = random.choice(items_pool[selected_rarity])
    
    # Списываем средства
    cur.execute(
        "UPDATE users SET balance = balance - %s WHERE id = %s",
        (case['price'], user_id)
    )
    
    # Добавляем предмет в инвентарь
    cur.execute(
        "INSERT INTO inventory (user_id, item_name, rarity) VALUES (%s, %s, %s) RETURNING id",
        (user_id, won_item['name'], won_item['rarity'])
    )
    
    item_id = cur.fetchone()['id']
    
    # Сохраняем транзакцию (если таблица существует)
    try:
        cur.execute(
            "INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s)",
            (user_id, -case['price'], 'case_open', f"Открытие кейса: {case['name']}")
        )
    except:
        pass
    
    conn.commit()
    
    # Получаем обновленный баланс
    cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
    new_balance = cur.fetchone()['balance']
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'item': won_item,
            'item_id': item_id,
            'new_balance': new_balance
        })
    }