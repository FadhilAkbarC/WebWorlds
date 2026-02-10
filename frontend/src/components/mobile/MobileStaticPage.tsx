import React from 'react';

interface MobileStaticPageProps {
  title: string;
  children: React.ReactNode;
}

const MobileStaticPage: React.FC<MobileStaticPageProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 pt-4 pb-10">
      <h1 className="text-xl font-semibold text-white mb-4">{title}</h1>
      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 text-sm text-slate-300 space-y-4">
        {children}
      </div>
    </div>
  );
};

export default MobileStaticPage;

