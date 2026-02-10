'use client';

import React, { useEffect, useState } from 'react';

type NetworkInfo = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

const SlowConnectionNotice: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection as NetworkInfo | undefined;
    if (!connection) return;

    const update = () => {
      const slowTypes = ['slow-2g', '2g'];
      const isSlow =
        Boolean(connection.saveData) ||
        (connection.effectiveType ? slowTypes.includes(connection.effectiveType) : false);
      setShow(isSlow);
    };

    update();
    connection.addEventListener?.('change', update);

    return () => {
      connection.removeEventListener?.('change', update);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="sticky top-0 z-[999] w-full bg-slate-900/95 px-4 py-2 text-xs text-slate-200">
      Low data mode detected. Images and heavy sections will load on demand.
    </div>
  );
};

export default SlowConnectionNotice;
