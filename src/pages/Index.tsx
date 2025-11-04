import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
}

interface InventoryItem {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  obtainedAt: string;
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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('cases');

  const cases: CaseItem[] = [
    { id: 1, name: 'Стартовый кейс', rarity: 'common', price: 50, image: '🎁' },
    { id: 2, name: 'Редкий кейс', rarity: 'rare', price: 150, image: '💎' },
    { id: 3, name: 'Эпический кейс', rarity: 'epic', price: 300, image: '👑' },
    { id: 4, name: 'Легендарный кейс', rarity: 'legendary', price: 500, image: '⚡' }
  ];

  const promoCodes: PromoCode[] = [
    { id: 1, code: 'WELCOME10', discount: 10, seller: 'Игрок123', price: 25 },
    { id: 2, code: 'LUCKY50', discount: 50, seller: 'ProGamer', price: 75 },
    { id: 3, code: 'MEGA100', discount: 100, seller: 'CaseMaster', price: 150 }
  ];

  const handleLogin = (asAdmin = false) => {
    setIsLoggedIn(true);
    setIsAdmin(asAdmin);
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

    setTimeout(() => {
      const rarities: ('common' | 'rare' | 'epic' | 'legendary')[] = ['common', 'rare', 'epic', 'legendary'];
      const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
      const newItem: InventoryItem = {
        id: Date.now(),
        name: `Предмет ${randomRarity}`,
        rarity: randomRarity,
        obtainedAt: new Date().toLocaleString('ru-RU')
      };
      setOpenedItem(newItem);
      setInventory([...inventory, newItem]);
      setIsOpening(false);
    }, 3000);
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
              <h2 className="text-4xl font-bold">Торговая площадка</h2>
              <p className="text-muted-foreground">Покупай и продавай промо-коды</p>
            </div>

            <div className="grid gap-4">
              {promoCodes.map((promo) => (
                <Card key={promo.id} className="p-6 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-lg px-4 py-1 font-mono">
                          {promo.code}
                        </Badge>
                        <Badge className="bg-accent">-{promo.discount}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Продавец: <span className="text-foreground">{promo.seller}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{promo.price}₽</div>
                      </div>
                      <Button className="glow-pink">
                        <Icon name="ShoppingBag" className="mr-2" size={18} />
                        Купить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {isLoggedIn && (
              <Card className="p-6 border-2 border-dashed border-primary/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Хочешь продать промо-код?</h3>
                    <p className="text-sm text-muted-foreground">Выставь свой код на продажу</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Plus" size={18} />
                    Добавить код
                  </Button>
                </div>
              </Card>
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
                  <Card key={item.id} className="p-4 hover:border-primary transition-colors">
                    <div className="space-y-3">
                      <Badge className={`${rarityColors[item.rarity]} w-full justify-center`}>
                        {item.rarity}
                      </Badge>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.obtainedAt}</p>
                      <Button variant="outline" size="sm" className="w-full">
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
                <div>
                  <h2 className="text-2xl font-bold">Игрок123</h2>
                  <p className="text-muted-foreground">Баланс: {balance}₽</p>
                </div>
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
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Пароль</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button onClick={() => handleLogin(false)} className="w-full glow-purple">
                Войти
              </Button>
              <Button onClick={() => handleLogin(true)} variant="outline" className="w-full">
                <Icon name="Shield" className="mr-2" size={18} />
                Войти как админ
              </Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label>Никнейм</Label>
                <Input placeholder="Игрок123" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Пароль</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button onClick={handleLogin} className="w-full glow-purple">
                Зарегистрироваться
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpening} onOpenChange={setIsOpening}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center space-y-6 py-8">
            <div className="text-8xl animate-spin-slow">{selectedCase?.image}</div>
            <h3 className="text-2xl font-bold animate-glow-pulse">Открываем кейс...</h3>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!openedItem} onOpenChange={() => setOpenedItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center space-y-6 py-8 animate-slide-up">
            <div className="text-6xl">🎉</div>
            <h3 className="text-3xl font-bold">Поздравляем!</h3>
            <Card className={`p-6 border-4 ${rarityColors[openedItem?.rarity || 'common']} border-opacity-50`}>
              <Badge className={`${rarityColors[openedItem?.rarity || 'common']} mb-4`}>
                {openedItem?.rarity}
              </Badge>
              <h4 className="text-2xl font-bold">{openedItem?.name}</h4>
            </Card>
            <Button onClick={() => setOpenedItem(null)} className="w-full glow-purple">
              Отлично!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;