// frontend/src/components/manager/TableQRPrinter.jsx
import React, { useRef } from 'react';

const TableQRPrinter = ({ tables = [], hotelName = 'Al-Bukhari Grand' }) => {
    const printRef = useRef();

    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-base font-bold">Printable Table QR Cards</h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Generate ready-to-print QR cards for restaurant tables.
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    🖨️ Print All QR Cards
                </button>
            </div>

            {/* PRINTABLE AREA */}
            <div ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tables.map((table) => {
                    // Dynamic URL for scanning table QR code
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${window.location.origin}/menu/${table._id}`
                    )}`;

                    return (
                        <div
                            key={table._id}
                            className="p-6 rounded-2xl border text-center shadow-sm flex flex-col items-center justify-between space-y-4 print:break-inside-avoid print:border-2 print:border-black"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div>
                                <h3 className="text-sm font-extrabold tracking-wider uppercase" style={{ color: 'var(--color-primary)' }}>
                                    {hotelName}
                                </h3>
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    Welcome to our dining room
                                </p>
                            </div>

                            {/* QR Image */}
                            <div className="p-3 bg-white rounded-xl border border-gray-200 inline-block shadow-inner">
                                <img src={qrUrl} alt={`QR Code for ${table.tableNumber}`} className="w-36 h-36 mx-auto" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black">{table.tableNumber}</h2>
                                <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--color-primary)' }}>
                                    📱 Scan QR Code To Order
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TableQRPrinter;