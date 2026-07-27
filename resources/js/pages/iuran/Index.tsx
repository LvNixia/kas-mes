import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Pencil } from 'lucide-react';

interface IuranData {
    id: number;
    amount: number;
    transaction_id: number | null;
}

interface UserMatrix {
    user: {
        id: number;
        name: string;
        nama_mes: string;
    };
    months: Record<number, IuranData | null>;
}

export default function IuranIndex({
    year,
    matrix,
    settings,
}: {
    year: number;
    matrix: UserMatrix[];
    settings: Record<number, number>;
}) {
    const monthsName = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const [selectedYear, setSelectedYear] = useState(year);
    
    // Modal states for paying iuran
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [payData, setPayData] = useState({
        user_id: 0,
        userName: '',
        month: 1,
        year: year,
        amount: 0,
    });

    // Modal states for setting target iuran
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [settingData, setSettingData] = useState({
        month: 1,
        year: year,
        amount: 0,
    });

    const handleYearChange = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('iuran.index'), { year: selectedYear }, { preserveState: true });
    };

    const openPayModal = (user: any, month: number, targetAmount: number) => {
        setPayData({
            user_id: user.id,
            userName: user.name,
            month: month,
            year: year,
            amount: targetAmount,
        });
        setIsPayModalOpen(true);
    };

    const openSettingModal = (month: number) => {
        setSettingData({
            month,
            year: year,
            amount: settings[month] || 0,
        });
        setIsSettingModalOpen(true);
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('iuran.store'), payData, {
            onSuccess: () => setIsPayModalOpen(false),
        });
    };

    const submitSetting = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('iuran.settings.update'), settingData, {
            onSuccess: () => setIsSettingModalOpen(false),
        });
    };

    const deletePayment = (iuranId: number) => {
        if (confirm('Yakin ingin menghapus data pembayaran ini? Transaksi di kas juga akan dihapus.')) {
            router.delete(route('iuran.destroy', iuranId));
        }
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    return (
        <>
            <Head title={`Iuran Bulanan ${year}`} />
            
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Data Iuran Anggota MES</h1>
                    
                    <form onSubmit={handleYearChange} className="flex gap-2">
                        <Input 
                            type="number" 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="w-24"
                        />
                        <Button type="submit">Tampilkan</Button>
                    </form>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 font-medium min-w-[200px] border-b border-r sticky left-0 bg-muted/90 backdrop-blur-sm z-10">Nama Anggota</th>
                                    {monthsName.map((month, idx) => (
                                        <th key={month} className="px-4 py-3 font-medium min-w-[150px] border-b text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span>{month}</span>
                                                <button 
                                                    onClick={() => openSettingModal(idx + 1)}
                                                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                                                >
                                                    {settings[idx + 1] ? formatRupiah(settings[idx + 1]) : 'Set Target'}
                                                    <Pencil size={12} />
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((row) => (
                                    <tr key={row.user.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 border-r font-medium sticky left-0 bg-card z-10">
                                            <div className="flex flex-col">
                                                <span>{row.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{row.user.nama_mes}</span>
                                            </div>
                                        </td>
                                        
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                                            const iuran = row.months[month];
                                            const targetAmount = settings[month] || 0;
                                            
                                            return (
                                                <td key={month} className="px-4 py-3 text-center border-r last:border-r-0">
                                                    {iuran ? (
                                                        <div className="flex flex-col items-center gap-1 group relative">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                                                                <Check size={14} /> Lunas
                                                            </span>
                                                            <span className="text-xs">{formatRupiah(iuran.amount)}</span>
                                                            
                                                            <button 
                                                                onClick={() => deletePayment(iuran.id)}
                                                                className="absolute top-0 right-0 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Hapus Pembayaran"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-xs h-7"
                                                            onClick={() => openPayModal(row.user, month, targetAmount)}
                                                        >
                                                            Bayar
                                                        </Button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Pembayaran Iuran */}
            <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
                <DialogContent>
                    <form onSubmit={submitPayment}>
                        <DialogHeader>
                            <DialogTitle>Catat Pembayaran Iuran</DialogTitle>
                            <DialogDescription>
                                Pembayaran untuk {payData.userName}, Bulan {monthsName[payData.month - 1]} {payData.year}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Nominal Pembayaran (Rp)</Label>
                                <Input 
                                    id="amount" 
                                    type="number" 
                                    value={payData.amount} 
                                    onChange={(e) => setPayData({...payData, amount: parseInt(e.target.value) || 0})}
                                    required 
                                />
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPayModalOpen(false)}>Batal</Button>
                            <Button type="submit">Simpan & Masuk Kas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Setting Target Iuran */}
            <Dialog open={isSettingModalOpen} onOpenChange={setIsSettingModalOpen}>
                <DialogContent>
                    <form onSubmit={submitSetting}>
                        <DialogHeader>
                            <DialogTitle>Set Target Iuran</DialogTitle>
                            <DialogDescription>
                                Tentukan target nominal iuran untuk Bulan {monthsName[settingData.month - 1]} {settingData.year}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="target_amount">Target Nominal (Rp)</Label>
                                <Input 
                                    id="target_amount" 
                                    type="number" 
                                    value={settingData.amount} 
                                    onChange={(e) => setSettingData({...settingData, amount: parseInt(e.target.value) || 0})}
                                    required 
                                />
                                <span className="text-xs text-muted-foreground">Isi 0 jika tidak ada target spesifik di bulan ini.</span>
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSettingModalOpen(false)}>Batal</Button>
                            <Button type="submit">Simpan Target</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

IuranIndex.layout = {
    breadcrumbs: [
        { title: 'Iuran Bulanan', href: '/iuran' },
    ],
};
