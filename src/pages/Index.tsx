import { useState, useEffect } from 'react';
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
  seller?: string;
  sellerId?: number;
  description?: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500'
};

const API_URLS = {
  market: 'https://functions.poehali.dev/076f78f2-45a0-4371-aa9f-586bae5c6249',
  openCase: 'https://functions.poehali.dev/87730d96-1a8e-4911-bf95-e327330662d5',
  chat: 'https://functions.poehali.dev/598d042d-a1e7-4d5e-a10d-e7ecbf61eb93'
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number>(1);
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
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedChatItem, setSelectedChatItem] = useState<InventoryItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const cases: CaseItem[] = [
    { id: 1, name: 'Стартовый кейс', rarity: 'common', price: 50, image: '🎁' },
    { id: 2, name: 'Редкий кейс', rarity: 'rare', price: 150, image: '💎' },
    { id: 3, name: 'Эпический кейс', rarity: 'epic', price: 300, image: '👑' },
    { id: 4, name: 'Легендарный кейс', rarity: 'legendary', price: 500, image: '⚡' }
  ];

  useEffect(() => {
    if (isLoggedIn) {
      loadMarketItems();
    }
  }, [isLoggedIn]);

  const loadMarketItems = async () => {
    try {
      const response = await fetch(API_URLS.market);
      const data = await response.json();
      const items: InventoryItem[] = data.items.map((item: any) => ({
        id: item.id,
        name: item.item_name,
        rarity: item.rarity.toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary',
        obtainedAt: new Date(item.created_at).toLocaleString('ru-RU'),
        image: getItemEmoji(item.item_name),
        isForSale: true,
        salePrice: item.price,
        seller: item.seller_username,
        sellerId: item.user_id,
        description: item.description || 'Описание отсутствует'
      }));
      setMarketItems(items);
    } catch (error) {
      console.error('Ошибка загрузки маркета:', error);
    }
  };

  const getItemEmoji = (itemName: string): string => {
    if (itemName.includes('меч')) return '🗡️';
    if (itemName.includes('корона')) return '👑';
    if (itemName.includes('молния')) return '⚡';
    if (itemName.includes('щит')) return '🛡️';
    if (itemName.includes('лук')) return '🏹';
    if (itemName.includes('кристалл')) return '🔮';
    if (itemName.includes('монета')) return '🪙';
    if (itemName.includes('камень')) return '🪨';
    if (itemName.includes('трава')) return '🌿';
    if (itemName.includes('хлеб')) return '🍞';
    return '📦';
  };

  const handleLogin = (name: string, admin: boolean = false) => {
    setIsLoggedIn(true);
    setIsAdmin(admin);
    setUsername(name);
    setUserId(1);
    setShowAuthDialog(false);
  };

  const handleOpenCase = async (caseItem: CaseItem) => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    if (balance < caseItem.price) {
      alert('Недостаточно средств!');
      return;
    }

    try {
      const response = await fetch(API_URLS.openCase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, case_id: caseItem.id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSelectedCase(caseItem);
        setIsOpening(true);
        setBalance(data.new_balance);
        
        setTimeout(() => {
          handleCaseOpenComplete({
            name: data.item.name,
            rarity: data.item.rarity.toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary',
            image: getItemEmoji(data.item.name)
          });
        }, 3000);
      } else {
        alert(data.error || 'Ошибка открытия кейса');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка подключения к серверу');
    }
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

  const confirmSellItem = async () => {
    if (!selectedItemForSale) return;

    try {
      const response = await fetch(API_URLS.market, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          user_id: userId,
          item_id: selectedItemForSale.id,
          price: salePrice,
          description: `Эксклюзивный предмет редкости ${selectedItemForSale.rarity}. В отличном состоянии!`
        })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedInventory = inventory.filter(item => item.id !== selectedItemForSale.id);
        setInventory(updatedInventory);
        await loadMarketItems();
        setShowSellDialog(false);
        setSelectedItemForSale(null);
        alert('Предмет выставлен на продажу!');
      } else {
        alert(data.error || 'Ошибка при выставлении на продажу');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка подключения к серверу');
    }
  };

  const handleOpenChat = async (item: InventoryItem) => {
    setSelectedChatItem(item);
    setShowChatDialog(true);
    
    try {
      const response = await fetch(`${API_URLS.chat}?market_item_id=${item.id}`);
      const data = await response.json();
      
      const messages: ChatMessage[] = data.messages.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender_username,
        text: msg.message,
        timestamp: new Date(msg.created_at).toLocaleTimeString('ru-RU')
      }));
      
      setChatMessages(messages);
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
      setChatMessages([
        { id: 1, sender: item.seller || 'Продавец', text: 'Здравствуйте! Интересует этот предмет?', timestamp: new Date().toLocaleTimeString('ru-RU') }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatItem) return;
    
    try {
      const response = await fetch(API_URLS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_item_id: selectedChatItem.id,
          sender_id: userId,
          message: newMessage
        })
      });

      if (response.ok) {
        const message: ChatMessage = {
          id: chatMessages.length + 1,
          sender: username || 'Вы',
          text: newMessage,
          timestamp: new Date().toLocaleTimeString('ru-RU')
        };
        
        setChatMessages([...chatMessages, message]);
        setNewMessage('');

        setTimeout(() => {
          const reply: ChatMessage = {
            id: chatMessages.length + 2,
            sender: selectedChatItem?.seller || 'Продавец',
            text: 'Спасибо за интерес! Готов обсудить детали сделки.',
            timestamp: new Date().toLocaleTimeString('ru-RU')
          };
          setChatMessages(prev => [...prev, reply]);
        }, 1000);
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleBuyMarketItem = async (item: InventoryItem) => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    if (balance < (item.salePrice || 0)) {
      alert('Недостаточно средств!');
      return;
    }

    try {
      const response = await fetch(API_URLS.market, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          user_id: userId,
          market_item_id: item.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        await loadMarketItems();
        setBalance(data.new_balance);
        
        const boughtItem: InventoryItem = {
          ...item,
          id: Date.now(),
          isForSale: false,
          obtainedAt: new Date().toLocaleString('ru-RU')
        };
        setInventory([...inventory, boughtItem]);
        alert('Предмет успешно куплен!');
      } else {
        alert(data.error || 'Ошибка при покупке');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-primary/20 bg-gradient-to-r from-card/90 via-card/50 to-card/90 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-5xl animate-float drop-shadow-lg">🎮</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                CaseOpener
              </h1>
              <p className="text-xs text-muted-foreground">Открывай. Торгуй. Побеждай.</p>
            </div>
          </div>

          <nav className="hidden md:flex gap-2">
            <Button 
              variant={activeTab === 'cases' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('cases')}
              className={activeTab === 'cases' ? 'glow-purple' : ''}
            >
              <Icon name="Package" className="mr-2" size={20} />
              Кейсы
            </Button>
            <Button 
              variant={activeTab === 'market' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('market')}
              className={activeTab === 'market' ? 'glow-pink' : ''}
            >
              <Icon name="ShoppingCart" className="mr-2" size={20} />
              Маркет
            </Button>
            {isLoggedIn && (
              <>
                <Button 
                  variant={activeTab === 'inventory' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('inventory')}
                  className={activeTab === 'inventory' ? 'glow-purple' : ''}
                >
                  <Icon name="Archive" className="mr-2" size={20} />
                  Инвентарь
                </Button>
                {isAdmin && (
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('admin')}
                    className="border-primary/50 hover:bg-primary/20"
                  >
                    <Icon name="Shield" className="mr-2" size={20} />
                    Админ
                  </Button>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary/30 to-secondary/30 border border-primary/50 px-5 py-2.5 rounded-xl glow-purple backdrop-blur-sm">
                  <Icon name="Wallet" size={22} className="text-primary" />
                  <span className="font-bold text-lg">{balance}₽</span>
                </div>
                <Button 
                  onClick={() => setActiveTab('profile')} 
                  variant="outline" 
                  className="gap-2 border-primary/50 hover:bg-primary/20"
                  size="lg"
                >
                  <Icon name="User" size={20} />
                  <span className="hidden sm:inline">{username || 'Профиль'}</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)} className="glow-purple" size="lg">
                <Icon name="LogIn" className="mr-2" size={20} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="p-7 hover:scale-110 transition-all duration-300 cursor-pointer border-2 hover:border-primary group relative overflow-hidden bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl"
                  onClick={() => handleOpenCase(caseItem)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative space-y-5">
                    <div className="text-7xl text-center animate-float drop-shadow-2xl">{caseItem.image}</div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-2xl text-center group-hover:text-primary transition-colors">{caseItem.name}</h3>
                      <Badge className={`${rarityColors[caseItem.rarity]} w-full justify-center text-sm py-1.5 shadow-lg`}>
                        {caseItem.rarity.toUpperCase()}
                      </Badge>
                      <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary pt-2">
                        <Icon name="Wallet" size={20} />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{caseItem.price}₽</span>
                      </div>
                    </div>
                    <Button className="w-full glow-purple shadow-lg" size="lg">
                      <Icon name="Sparkles" className="mr-2" size={20} />
                      Открыть кейс
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
                  <Card key={item.id} className="p-6 hover:border-primary transition-all hover:scale-105 group border-2">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-7xl mb-3 group-hover:scale-110 transition-transform">{item.image}</div>
                        <Badge className={`${rarityColors[item.rarity]} mb-3 text-sm px-3 py-1`}>
                          {item.rarity}
                        </Badge>
                        <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                      
                      <div className="space-y-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="User" size={16} className="text-muted-foreground" />
                          <span className="text-muted-foreground">Продавец:</span>
                          <span className="font-semibold">{item.seller}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Clock" size={16} className="text-muted-foreground" />
                          <span className="text-muted-foreground">Выставлен:</span>
                          <span>{item.obtainedAt}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm text-muted-foreground">Цена:</span>
                          <span className="text-3xl font-bold text-primary">{item.salePrice}₽</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleOpenChat(item)} 
                            variant="outline"
                            className="flex-1"
                          >
                            <Icon name="MessageCircle" className="mr-2" size={18} />
                            Написать
                          </Button>
                          <Button 
                            onClick={() => handleBuyMarketItem(item)} 
                            className="flex-1 glow-pink"
                          >
                            <Icon name="ShoppingBag" className="mr-2" size={18} />
                            Купить
                          </Button>
                        </div>
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

        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Панель администратора
              </h2>
              <p className="text-muted-foreground text-lg">
                Управление системой и пользователями
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover:border-primary transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon name="Users" size={24} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">1</div>
                      <div className="text-sm text-muted-foreground">Пользователей</div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:border-secondary transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Icon name="Package" size={24} className="text-secondary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{cases.length}</div>
                      <div className="text-sm text-muted-foreground">Кейсов</div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:border-accent transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Icon name="ShoppingBag" size={24} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{marketItems.length}</div>
                      <div className="text-sm text-muted-foreground">На маркете</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Settings" size={24} />
                Настройки системы
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">Модерация маркета</div>
                    <div className="text-sm text-muted-foreground">Проверка предметов перед публикацией</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">Автоматическое обновление</div>
                    <div className="text-sm text-muted-foreground">Обновление маркета каждые 30 секунд</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">Логирование действий</div>
                    <div className="text-sm text-muted-foreground">Запись всех действий пользователей</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Database" size={24} />
                База данных
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Таблица: market_items</div>
                  <div className="text-2xl font-bold">{marketItems.length} записей</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Таблица: inventory</div>
                  <div className="text-2xl font-bold">{inventory.length} записей</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Таблица: chat_messages</div>
                  <div className="text-2xl font-bold">0 записей</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Таблица: users</div>
                  <div className="text-2xl font-bold">1 записей</div>
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
              <div className="space-y-2">
                <Button onClick={() => handleLogin('Админ', true)} variant="outline" className="w-full border-primary/50">
                  <Icon name="Shield" className="mr-2" size={16} />
                  Войти как админ (demo)
                </Button>
                <div className="text-center text-xs text-muted-foreground">
                  Для демонстрации: admin@caseopener.com / admin123
                </div>
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

      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Icon name="MessageCircle" size={24} className="text-primary" />
              <div>
                <div className="text-xl">Чат с продавцом</div>
                <div className="text-sm text-muted-foreground font-normal">{selectedChatItem?.seller}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex gap-3">
                <div className="text-4xl">{selectedChatItem?.image}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{selectedChatItem?.name}</h4>
                    <Badge className={`${rarityColors[selectedChatItem?.rarity || 'common']} text-xs`}>
                      {selectedChatItem?.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{selectedChatItem?.description}</p>
                  <div className="text-xl font-bold text-primary">{selectedChatItem?.salePrice}₽</div>
                </div>
              </div>
            </Card>

            <div className="h-[300px] overflow-y-auto border rounded-lg p-4 space-y-3 bg-muted/20">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === (username || 'Вы') ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === (username || 'Вы') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card border'
                  }`}>
                    <div className="font-semibold text-sm mb-1">{msg.sender}</div>
                    <div className="text-sm">{msg.text}</div>
                    <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Напишите сообщение..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="glow-purple">
                <Icon name="Send" size={18} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;