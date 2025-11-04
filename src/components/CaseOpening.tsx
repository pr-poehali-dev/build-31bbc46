import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Item {
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
}

interface CaseOpeningProps {
  onComplete: (item: Item) => void;
  caseRarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500'
};

const allItems: Item[] = [
  { name: 'Стикер 🎯', rarity: 'common', image: '🎯' },
  { name: 'Граффити 🎨', rarity: 'common', image: '🎨' },
  { name: 'Значок ⭐', rarity: 'rare', image: '⭐' },
  { name: 'Скин 🔫', rarity: 'rare', image: '🔫' },
  { name: 'Нож 🗡️', rarity: 'epic', image: '🗡️' },
  { name: 'Перчатки 🧤', rarity: 'epic', image: '🧤' },
  { name: 'Дракон 🐉', rarity: 'legendary', image: '🐉' },
  { name: 'Корона 👑', rarity: 'legendary', image: '👑' },
  { name: 'Меч ⚔️', rarity: 'legendary', image: '⚔️' }
];

export default function CaseOpening({ onComplete, caseRarity }: CaseOpeningProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [wonItem, setWonItem] = useState<Item | null>(null);

  useEffect(() => {
    const generateItems = () => {
      const itemList: Item[] = [];
      for (let i = 0; i < 50; i++) {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        itemList.push(randomItem);
      }
      
      const rarityWeights = {
        common: [0.7, 0.2, 0.08, 0.02],
        rare: [0.5, 0.3, 0.15, 0.05],
        epic: [0.3, 0.3, 0.3, 0.1],
        legendary: [0.1, 0.2, 0.3, 0.4]
      };

      const weights = rarityWeights[caseRarity];
      const rand = Math.random();
      let targetRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
      
      if (rand < weights[3]) targetRarity = 'legendary';
      else if (rand < weights[2] + weights[3]) targetRarity = 'epic';
      else if (rand < weights[1] + weights[2] + weights[3]) targetRarity = 'rare';
      else targetRarity = 'common';

      const targetItems = allItems.filter(item => item.rarity === targetRarity);
      const finalItem = targetItems[Math.floor(Math.random() * targetItems.length)];
      
      itemList[25] = finalItem;
      setWonItem(finalItem);
      setItems(itemList);
    };

    generateItems();
  }, [caseRarity]);

  useEffect(() => {
    if (!isSpinning) return;

    const duration = 4000;
    const startTime = Date.now();
    const targetOffset = -(25 * 180 + 40);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentOffset = targetOffset * easeOut;
      
      setOffset(currentOffset);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setTimeout(() => {
          if (wonItem) onComplete(wonItem);
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning, wonItem, onComplete]);

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary z-10 glow-purple" style={{ transform: 'translateX(-50%)' }} />
      
      <div className="flex gap-4 transition-transform" style={{ transform: `translateX(calc(50% + ${offset}px))` }}>
        {items.map((item, index) => (
          <Card
            key={index}
            className={`min-w-[160px] h-[200px] flex flex-col items-center justify-center p-4 border-2 ${
              index === 25 && !isSpinning ? 'border-primary scale-110 glow-purple' : 'border-border'
            } transition-all duration-300`}
          >
            <div className="text-6xl mb-3">{item.image}</div>
            <Badge className={`${rarityColors[item.rarity]} mb-2`}>
              {item.rarity}
            </Badge>
            <p className="text-sm font-semibold text-center">{item.name}</p>
          </Card>
        ))}
      </div>

      <div className="text-center mt-6">
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
