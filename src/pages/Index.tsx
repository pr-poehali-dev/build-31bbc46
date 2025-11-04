import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import CaseOpening from '@/components/CaseOpening';

interface CaseItem {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  image: string;
}

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  seller: string;
  price: number;
  itemId?: number;
}

interface InventoryItem {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  obtainedAt: string;
  image: string;
  isForSale?: boolean;
  salePrice?: number;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500'
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [marketItems, setMarketItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('cases');
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [selectedItemForSale, setSelectedItemForSale] = useState<InventoryItem | null>(null);
  const [salePrice, setSalePrice] = useState(0);

  const cases: CaseItem[] = [
    { id: 1, name: 'Стартовый кейс', rarity: 'common', price: 50, image: '🎁' },
    { id: 2, name: 'Редкий кейс', rarity: 'rare', price: 150, image: '💎' },
    { id: 3, name: 'Эпический кейс', rarity: 'epic', price: 300, image: '👑' },
    { id: 4, name: 'Легендарный кейс', rarity: 'legendary', price: 500, image: '⚡' }
  ];

  const handleLogin = (name: string, admin: boolean = false) => {
    setIsLoggedIn(true);
    setIsAdmin(admin);
    setUsername(name);
    setShowAuthDialog(false);
  };

  const handleOpenCase = (caseItem: CaseItem) => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    if (balance < caseItem.price) {
      alert('Недостаточно средств!');
      return;
    }

    setSelectedCase(caseItem);
    setIsOpening(true);
    setBalance(balance - caseItem.price);
  };

  const handleCaseOpenComplete = (item: { name: string; rarity: 'common' | 'rare' | 'epic' | 'legendary'; image: string }) => {
    const newItem: InventoryItem = {
      id: Date.now(),
      name: item.name,
      rarity: item.rarity,
      image: item.image,
      obtainedAt: new Date().toLocaleString('ru-RU'),
      isForSale: false
    };
    setOpenedItem(newItem);
    setInventory([...inventory, newItem]);
    setIsOpening(false);
  };

  const handleSellItem = (item: InventoryItem) => {
    setSelectedItemForSale(item);
    setSalePrice(Math.floor(Math.random() * 200) + 50);
    setShowSellDialog(true);
  };

  const confirmSellItem = () => {
    if (!selectedItemForSale) return;

    const updatedInventory = inventory.filter(item => item.id !== selectedItemForSale.id);
    setInventory(updatedInventory);

    const marketItem: InventoryItem = {
      ...selectedItemForSale,
      isForSale: true,
      salePrice: salePrice
    };
    setMarketItems([...marketItems, marketItem]);
    setBalance(balance + salePrice);
    setShowSellDialog(false);
    setSelectedItemForSale(null);
  };

  const handleBuyMarketItem = (item: InventoryItem) => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    if (balance < (item.salePrice || 0)) {
      alert('Недостаточно средств!');
      return;
    }

    const updatedMarket = marketItems.filter(m => m.id !== item.id);
    setMarketItems(updatedMarket);

    const boughtItem: InventoryItem = {
      ...item,
      id: Date.now(),
      isForSale: false,
      obtainedAt: new Date().toLocaleString('ru-RU')
    };
    setInventory([...inventory, boughtItem]);
    setBalance(balance - (item.salePrice || 0));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-4xl animate-float">🎮</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CaseOpener
            </h1>
          </div>

          <nav className="hidden md:flex gap-6">
            <Button variant="ghost" onClick={() => setActiveTab('cases')}>
              <Icon name="Package" className="mr-2" size={20} />
              Кейсы
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab('market')}>
              <Icon name="ShoppingCart" className="mr-2" size={20} />
              Маркет
            </Button>
            {isLoggedIn && (
              <Button variant="ghost" onClick={() => setActiveTab('inventory')}>
                <Icon name="Archive" className="mr-2" size={20} />
                Инвентарь
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-lg glow-purple">
                  <Icon name="Wallet" size={20} className="text-primary" />
                  <span className="font-semibold">{balance}₽</span>
                </div>
                {isAdmin && (
                  <Button onClick={() => window.location.href = '/admin'} variant="outline" className="gap-2">
                    <Icon name="Shield" size={20} />
                    Админ
                  </Button>
                )}
                <Button onClick={() => setActiveTab('profile')} variant="outline" className="gap-2">
                  <Icon name="User" size={20} />
                  Профиль
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)} className="glow-purple">
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'cases' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-glow-pulse">
                Открывай кейсы и получай награды!
              </h2>
              <p className="text-muted-foreground text-lg">
                Выбирай кейс, крути барабан и выигрывай эксклюзивные предметы
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="p-6 hover:scale-105 transition-transform cursor-pointer border-2 hover:border-primary group relative overflow-hidden"
                  onClick={() => handleOpenCase(caseItem)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-4">
                    <div className="text-6xl text-center animate-float">{caseItem.image}</div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-center">{caseItem.name}</h3>
                      <Badge className={`${rarityColors[caseItem.rarity]} w-full justify-center`}>
                        {caseItem.rarity}
                      </Badge>
                      <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                        <Icon name="Wallet" size={18} />
                        {caseItem.price}₽
                      </div>
                    </div>
                    <Button className="w-full glow-purple" size="lg">
                      Открыть
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Торговая площадка
              </h2>
              <p className="text-muted-foreground text-lg">Покупай предметы других игроков</p>
            </div>

            {marketItems.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <div className="text-6xl">🏪</div>
                <h3 className="text-xl font-semibold">Рынок пуст</h3>
                <p className="text-muted-foreground">Пока никто не выставил предметы на продажу</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketItems.map((item) => (
                  <Card key={item.id} className="p-6 hover:border-primary transition-all hover:scale-105 group">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-7xl mb-3 group-hover:scale-110 transition-transform">{item.image}</div>
                        <Badge className={`${rarityColors[item.rarity]} mb-2`}>
                          {item.rarity}
                        </Badge>
                        <h3 className="font-bold text-xl">{item.name}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Цена:</span>
                          <span className="text-2xl font-bold text-primary">{item.salePrice}₽</span>
                        </div>
                        <Button 
                          onClick={() => handleBuyMarketItem(item)} 
                          className="w-full glow-pink"
                          size="lg"
                        >
                          <Icon name="ShoppingBag" className="mr-2" size={18} />
                          Купить
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && isLoggedIn && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">Мой инвентарь</h2>
              <p className="text-muted-foreground">Все предметы, которые ты получил</p>
            </div>

            {inventory.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <div className="text-6xl">📦</div>
                <h3 className="text-xl font-semibold">Инвентарь пуст</h3>
                <p className="text-muted-foreground">Открой свой первый кейс, чтобы получить предметы!</p>
                <Button onClick={() => setActiveTab('cases')} className="glow-purple">
                  Открыть кейсы
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {inventory.map((item) => (
                  <Card key={item.id} className="p-6 hover:border-primary transition-all hover:scale-105 group">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">{item.image}</div>
                        <Badge className={`${rarityColors[item.rarity]} w-full justify-center mb-2`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-center">{item.name}</h3>
                      <p className="text-xs text-muted-foreground text-center">{item.obtainedAt}</p>
                      <Button 
                        onClick={() => handleSellItem(item)} 
                        variant="outline" 
                        size="sm" 
                        className="w-full hover:bg-primary hover:text-primary-foreground"
                      >
                        <Icon name="Tag" className="mr-2" size={16} />
                        Продать
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && isLoggedIn && (
          <div className="max-w-2xl mx-auto space-y-8">
            <Card className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
                  🎮
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{username || 'Игрок123'}</h2>
                    {isAdmin && (
                      <Badge className="bg-primary">
                        <Icon name="Shield" className="mr-1" size={14} />
                        Админ
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">Баланс: {balance}₽</p>
                </div>
                {isAdmin && (
                  <Button onClick={() => window.location.href = '/admin'} variant="outline" className="gap-2">
                    <Icon name="Settings" size={18} />
                    Панель управления
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Пополнить баланс</Label>
                  <div className="flex gap-2 mt-2">
                    <Input type="number" placeholder="Сумма" />
                    <Button className="glow-purple">
                      <Icon name="CreditCard" className="mr-2" size={18} />
                      Пополнить
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Card className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{inventory.length}</div>
                    <div className="text-sm text-muted-foreground">Предметов</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-3xl font-bold text-secondary">0</div>
                    <div className="text-sm text-muted-foreground">Продано</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-3xl font-bold text-accent">{inventory.length}</div>
                    <div className="text-sm text-muted-foreground">Открыто</div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Войти в аккаунт</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="your@email.com"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin('Игрок', false)}
                />
              </div>
              <div className="space-y-2">
                <Label>Пароль</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin('Игрок', false)}
                />
              </div>
              <Button onClick={() => handleLogin('Игрок', false)} className="w-full glow-purple">
                Войти
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Для входа как админ: admin@caseopener.com / admin123
              </div>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label>Никнейм</Label>
                <Input 
                  placeholder="Игрок123"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Пароль</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button onClick={() => handleLogin(username || 'Игрок', false)} className="w-full glow-purple">
                Зарегистрироваться
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpening} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center font-bold">
              {selectedCase?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <CaseOpening 
              caseRarity={selectedCase.rarity} 
              onComplete={handleCaseOpenComplete}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!openedItem} onOpenChange={() => setOpenedItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center space-y-6 py-8 animate-slide-up">
            <div className="text-8xl animate-float">{openedItem?.image}</div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Поздравляем!
            </h3>
            <Card className={`p-6 border-4 border-primary glow-purple`}>
              <Badge className={`${rarityColors[openedItem?.rarity || 'common']} mb-4 text-lg px-4 py-1`}>
                {openedItem?.rarity}
              </Badge>
              <h4 className="text-2xl font-bold">{openedItem?.name}</h4>
            </Card>
            <div className="flex gap-2">
              <Button onClick={() => setOpenedItem(null)} className="flex-1 glow-purple">
                Отлично!
              </Button>
              <Button 
                onClick={() => {
                  if (openedItem) handleSellItem(openedItem);
                  setOpenedItem(null);
                }} 
                variant="outline" 
                className="flex-1"
              >
                <Icon name="Tag" className="mr-2" size={18} />
                Продать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Продать предмет</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedItemForSale && (
              <div className="text-center space-y-4">
                <div className="text-6xl">{selectedItemForSale.image}</div>
                <div>
                  <Badge className={`${rarityColors[selectedItemForSale.rarity]} mb-2`}>
                    {selectedItemForSale.rarity}
                  </Badge>
                  <h3 className="text-xl font-bold">{selectedItemForSale.name}</h3>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Цена продажи</Label>
              <Input 
                type="number" 
                value={salePrice}
                onChange={(e) => setSalePrice(parseInt(e.target.value) || 0)}
                placeholder="100"
              />
              <p className="text-sm text-muted-foreground">
                Рекомендуемая цена: {salePrice}₽
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowSellDialog(false)} variant="outline" className="flex-1">
                Отмена
              </Button>
              <Button onClick={confirmSellItem} className="flex-1 glow-purple">
                <Icon name="Tag" className="mr-2" size={18} />
                Выставить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;