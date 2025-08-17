import QRCode from 'react-qr-code';

export default function QRPassCard({ pass }) {
    // pass: { qrCode, status, eventName, holderName, issuedAt }
    return(
        <div className="bg-white p-4 shoadow rounded">
            <h3 className="text-lg font-semibold mb-2">{pass.eventName || 'Event Pass'}</h3>
            <div className="flex gap-4">
                <div className="p-3 bg-gray-50 rounded">
                    <QRCode value={pass.qrCode || ''} size={160} />
                </div>
                <div className="text-sm">
                    <p><b>Name:</b> {pass.holderName}</p>
                    <p><b>Status:</b> {pass.status}</p>
                    <p><b>Issued:</b> {pass.issuedAt ? new Date(pass.issuedAt).toLocaleString() : '-'}</p>
                 </div>
            </div>
        </div>
    );
}
