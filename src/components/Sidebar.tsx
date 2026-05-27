import { Tab } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  FlaskConical, 
  Newspaper, 
  Video, 
  HelpCircle, 
  LifeBuoy,
  Leaf,
  Phone
} from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ecopedia' as Tab, label: 'EcoPedia', icon: BookOpen },
    { id: 'ecolab' as Tab, label: 'EcoLab', icon: FlaskConical },
    { id: 'ecoupdate' as Tab, label: 'EcoUpdate', icon: Newspaper },
    { id: 'ecocreation' as Tab, label: 'EcoCreation', icon: Video },
    { id: 'ecochallenge' as Tab, label: 'EcoChallenge', icon: HelpCircle },
    { id: 'ecocontact' as Tab, label: 'EcoContact', icon: Phone },
  ];

  return (
    <aside 
      id="main-sidebar"
      className="fixed left-0 top-0 h-screen w-70 bg-[#154212] flex flex-col py-6 text-white shadow-xl z-50 overflow-y-auto"
    >
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#91f78e] shadow-inner flex items-center justify-center text-[#154212] transition-transform hover:scale-110 cursor-pointer">
          <Leaf className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
            GAS
          </h1>
          <p className="font-sans text-[10px] text-[#a1d494] opacity-90 tracking-wide leading-tight">
            From Knowledge to Sustainable Action
          </p>
        </div>
      </div>

      {/* Primary Navigation links */}
      <nav id="sidebar-nav" className="flex-grow space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left py-3.5 px-6 flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-sm font-medium border-l-4 ${
                isActive
                  ? 'bg-[#91f78e] text-[#002201] rounded-r-3xl font-semibold border-[#006e1c] scale-[0.98] shadow-md'
                  : 'text-[#bcf0ae] hover:text-white hover:bg-white/5 border-transparent hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#006e1c] fill-[#91f78e]' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav indicators */}
      <div className="mt-auto px-4 pt-4 border-t border-[#2d5a27] space-y-1">
        <button
          onClick={() => setActiveTab('support')}
          className={`w-full text-left py-2.5 px-4 rounded-lg flex items-center gap-3 transition-colors text-xs font-semibold cursor-pointer ${
            activeTab === 'support'
              ? 'bg-[#91f78e] text-[#002201] shadow-inner'
              : 'text-[#bcf0ae] hover:text-white hover:bg-white/5'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Dukungan & FAQ</span>
        </button>
      </div>
    </aside>
  );
}
