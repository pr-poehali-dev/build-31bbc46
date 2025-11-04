-- Удаляем проверку редкости из инвентаря
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_rarity_check;