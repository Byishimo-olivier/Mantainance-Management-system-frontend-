

const roles = [
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="28" fill="#F1F6FF"/>
        <circle cx="28" cy="22" r="8" fill="#2563eb"/>
        <rect x="14" y="34" width="28" height="10" rx="5" fill="#dbeafe"/>
        <rect x="18" y="38" width="20" height="4" rx="2" fill="#2563eb"/>
      </svg>
    ),
    title: "Tenant",
    description: "Report and track maintenance issues",
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="28" fill="#F5F1FF"/>
        <rect x="16" y="28" width="24" height="14" rx="4" fill="#a78bfa"/>
        <rect x="20" y="20" width="16" height="8" rx="2" fill="#ede9fe"/>
        <rect x="24" y="12" width="8" height="8" rx="2" fill="#8b5cf6"/>
        <rect x="22" y="36" width="12" height="4" rx="2" fill="#8b5cf6"/>
      </svg>
    ),
    title: "Property Owner/Manager",
    description: "Manage properties and oversee maintenance",
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="28" fill="#ECFDF5"/>
        <circle cx="28" cy="28" r="12" fill="#6ee7b7"/>
        <g>
          <circle cx="28" cy="28" r="6" fill="#059669"/>
          <rect x="27" y="18" width="2" height="6" rx="1" fill="#059669"/>
          <rect x="27" y="32" width="2" height="6" rx="1" fill="#059669"/>
          <rect x="18" y="27" width="6" height="2" rx="1" fill="#059669"/>
          <rect x="32" y="27" width="6" height="2" rx="1" fill="#059669"/>
        </g>
        <circle cx="28" cy="28" r="3" fill="#ECFDF5"/>
      </svg>
    ),
    title: "Technician",
    description: "Handle and complete maintenance tasks",
  },
];


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-8 h-16">
        <div className="flex items-center gap-3">
          <span className="text-3xl text-indigo-600">🏢</span>
          <span className="text-lg font-semibold text-gray-900">Define MVP Features</span>
        </div>
        <div className="flex gap-3">
          <a href="/login" className="px-4 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50">Login</a>
          <a href="/register" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Sign Up</a>
        </div>
      </nav>
      {/* Header */}
      <header className="text-center mt-12 mb-6">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <span className="text-indigo-600 text-4xl">🏢</span>
          Property Maintenance System
        </h1>
        <p className="text-lg text-gray-600 mt-3">Ensuring issues are fixed on time</p>
        <button className="mt-4 bg-white border border-indigo-100 rounded-xl px-6 py-2 text-base font-medium shadow inline-flex items-center gap-2 hover:bg-indigo-50">
          <span role="img" aria-label="globe">🌐</span> Kinyarwanda
        </button>
      </header>
      {/* Main */}
      <main className="max-w-4xl mx-auto text-center mt-8">
        <h2 className="text-2xl font-semibold mb-8">Select your role to continue</h2>
        <div className="flex flex-row justify-center gap-8 flex-nowrap overflow-x-auto pb-4">
          {roles.map((role) => (
            <div
              className="bg-white border border-indigo-100 rounded-2xl px-10 py-12 min-w-[240px] max-w-xs shadow hover:shadow-lg transition flex flex-col items-center cursor-pointer"
              key={role.title}
            >
              <div className="mb-4">{role.icon}</div>
              <div className="font-semibold text-lg mb-2">{role.title}</div>
              <div className="text-gray-600 text-base">{role.description}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
