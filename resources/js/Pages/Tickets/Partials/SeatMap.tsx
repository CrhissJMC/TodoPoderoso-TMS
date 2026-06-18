interface Props {
    sellableSeats: number;
    occupiedSeats: number[];
    selectedSeat: number | null;
    onSelect: (seat: number) => void;
}

export default function SeatMap({ sellableSeats, occupiedSeats, selectedSeat, onSelect }: Props) {
    const seats = Array.from({ length: sellableSeats }, (_, i) => i + 1);

    function seatClass(seat: number) {
        const isOccupied = occupiedSeats.includes(seat);
        const isSelected = selectedSeat === seat;

        if (isOccupied) {
            return 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200';
        }
        if (isSelected) {
            return 'bg-gray-900 text-white border-gray-900 shadow-sm scale-105';
        }
        return 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer';
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-white border border-gray-300" /> Disponible
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-900" /> Seleccionado
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-200" /> Ocupado
                </span>
            </div>

            {/* Indicador de volante */}
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="round" />
                </svg>
                Conductor
            </div>

            <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                {seats.map(seat => (
                    <button
                        key={seat}
                        type="button"
                        disabled={occupiedSeats.includes(seat)}
                        onClick={() => onSelect(seat)}
                        className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-all ${seatClass(seat)}`}
                    >
                        {seat}
                    </button>
                ))}
            </div>
        </div>
    );
}
