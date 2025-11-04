import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  is_admin: boolean;
  created_at: string;
}

interface Case {
  id: number;
  name: string;
  rarity: string;
  price: number;
  image: string;
  is_active: boolean;
}

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  seller_id: number;
  price: number;
  is_sold: boolean;
}

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);

  const [newCase, setNewCase] = useState({
    name: '',
    rarity: 'common',
    price: 50,
    image: '🎁'
  });

  useEffect(() => {
    setUsers([
      { id: 1, username: 'admin', email: 'admin@caseopener.com', balance: 999999, is_admin: true, created_at: new Date().toISOString() },
      { id: 2, username: 'Игрок123', email: 'player@example.com', balance: 1500, is_admin: false, created_at: new Date().toISOString() },
      { id: 3, username: 'ProGamer', email: 'pro@example.com', balance: 2300, is_admin: false, created_at: new Date().toISOString() }
    ]);

    setCases([
      { id: 1, name: 'Стартовый кейс', rarity: 'common', price: 50, image: '🎁', is_active: true },
      { id: 2, name: 'Редкий кейс', rarity: 'rare', price: 150, image: '💎', is_active: true },
      { id: 3, name: 'Эпический кейс', rarity: 'epic', price: 300, image: '👑', is_active: true },
      { id: 4, name: 'Легендарный кейс', rarity: 'legendary', price: 500, image: '⚡', is_active: true }
    ]);

    setPromoCodes([
      { id: 1, code: 'WELCOME10', discount: 10, seller_id: 2, price: 25, is_sold: false },
      { id: 2, code: 'LUCKY50', discount: 50, seller_id: 3, price: 75, is_sold: false },
      { id: 3, code: 'MEGA100', discount: 100, seller_id: 2, price: 150, is_sold: true }
    ]);

    setTransactions([
      { id: 1, user_id: 2, type: 'case_open', amount: -50, description: 'Открытие кейса: Стартовый кейс', created_at: new Date().toISOString() },
      { id: 2, user_id: 3, type: 'promo_buy', amount: -75, description: 'Покупка промо-кода: LUCKY50', created_at: new Date().toISOString() },
      { id: 3, user_id: 2, type: 'balance_add', amount: 500, description: 'Пополнение баланса', created_at: new Date().toISOString() }
    ]);
  }, []);

  const handleAddCase = () => {
    const newCaseItem: Case = {
      id: cases.length + 1,
      ...newCase,
      is_active: true
    };
    setCases([...cases, newCaseItem]);
    setIsAddCaseOpen(false);
    setNewCase({ name: '', rarity: 'common', price: 50, image: '🎁' });
  };

  const toggleCaseStatus = (caseId: number) => {
    setCases(cases.map(c => c.id === caseId ? { ...c, is_active: !c.is_active } : c));
  };

  const rarityColors: Record<string, string> = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-orange-500'
  };

  const stats = {
    totalUsers: users.length,
    totalCases: cases.length,
    activeCases: cases.filter(c => c.is_active).length,
    totalPromoCodes: promoCodes.length,
    soldPromoCodes: promoCodes.filter(p => p.is_sold).length,
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => t.type === 'case_open' ? sum + Math.abs(t.amount) : sum, 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Shield" className="text-primary" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Админ-панель
              </h1>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="ArrowLeft" className="mr-2" size={18} />
              На главную
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего пользователей</p>
                <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
              </div>
              <Icon name="Users" className="text-primary" size={40} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активных кейсов</p>
                <p className="text-3xl font-bold text-secondary">{stats.activeCases}/{stats.totalCases}</p>
              </div>
              <Icon name="Package" className="text-secondary" size={40} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Промо-кодов</p>
                <p className="text-3xl font-bold text-accent">{stats.totalPromoCodes}</p>
              </div>
              <Icon name="Tag" className="text-accent" size={40} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Доход</p>
                <p className="text-3xl font-bold text-primary">{stats.totalRevenue}₽</p>
              </div>
              <Icon name="TrendingUp" className="text-primary" size={40} />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="cases">Кейсы</TabsTrigger>
            <TabsTrigger value="promo">Промо-коды</TabsTrigger>
            <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Управление пользователями</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Никнейм</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Баланс</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-semibold">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-primary font-semibold">{user.balance}₽</TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge className="bg-primary">Админ</Badge>
                          ) : (
                            <Badge variant="outline">Игрок</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Управление кейсами</h2>
                  <Dialog open={isAddCaseOpen} onOpenChange={setIsAddCaseOpen}>
                    <DialogTrigger asChild>
                      <Button className="glow-purple">
                        <Icon name="Plus" className="mr-2" size={18} />
                        Добавить кейс
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Создать новый кейс</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Название</Label>
                          <Input
                            value={newCase.name}
                            onChange={(e) => setNewCase({ ...newCase, name: e.target.value })}
                            placeholder="Супер кейс"
                          />
                        </div>
                        <div>
                          <Label>Редкость</Label>
                          <Select value={newCase.rarity} onValueChange={(value) => setNewCase({ ...newCase, rarity: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="common">Common</SelectItem>
                              <SelectItem value="rare">Rare</SelectItem>
                              <SelectItem value="epic">Epic</SelectItem>
                              <SelectItem value="legendary">Legendary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Цена (₽)</Label>
                          <Input
                            type="number"
                            value={newCase.price}
                            onChange={(e) => setNewCase({ ...newCase, price: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Иконка (emoji)</Label>
                          <Input
                            value={newCase.image}
                            onChange={(e) => setNewCase({ ...newCase, image: e.target.value })}
                            placeholder="🎁"
                          />
                        </div>
                        <Button onClick={handleAddCase} className="w-full glow-purple">
                          Создать кейс
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Иконка</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Редкость</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell>{caseItem.id}</TableCell>
                        <TableCell className="text-3xl">{caseItem.image}</TableCell>
                        <TableCell className="font-semibold">{caseItem.name}</TableCell>
                        <TableCell>
                          <Badge className={rarityColors[caseItem.rarity]}>
                            {caseItem.rarity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-primary font-semibold">{caseItem.price}₽</TableCell>
                        <TableCell>
                          {caseItem.is_active ? (
                            <Badge className="bg-green-600">Активен</Badge>
                          ) : (
                            <Badge variant="outline">Неактивен</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCaseStatus(caseItem.id)}
                            >
                              <Icon name={caseItem.is_active ? 'EyeOff' : 'Eye'} size={16} />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Icon name="Edit" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="promo">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Промо-коды</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Код</TableHead>
                      <TableHead>Скидка</TableHead>
                      <TableHead>Продавец ID</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell>{promo.id}</TableCell>
                        <TableCell className="font-mono font-semibold">{promo.code}</TableCell>
                        <TableCell>
                          <Badge className="bg-accent">-{promo.discount}%</Badge>
                        </TableCell>
                        <TableCell>{promo.seller_id}</TableCell>
                        <TableCell className="text-primary font-semibold">{promo.price}₽</TableCell>
                        <TableCell>
                          {promo.is_sold ? (
                            <Badge variant="outline">Продан</Badge>
                          ) : (
                            <Badge className="bg-green-600">Активен</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">История транзакций</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{transaction.user_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </TableCell>
                        <TableCell className={transaction.amount > 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}₽
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{transaction.description}</TableCell>
                        <TableCell className="text-sm">{new Date(transaction.created_at).toLocaleString('ru-RU')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
