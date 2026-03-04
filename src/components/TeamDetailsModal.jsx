import React from 'react';
import { X } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const TeamDetailsModal = ({ show, team, people = [], users = [], onClose }) => {
  if (!show || !team) return null;

  const renderMember = (entry, i) => {
    if (!entry && entry !== 0) return null;
    if (typeof entry === 'object') return (<li key={i}>{entry.name || entry.email || JSON.stringify(entry)}</li>);
    const allPeople = (people || []).concat(users || []);
    const id = String(entry);
    const found = allPeople.find(p => String(p.id || p._id) === id || String(p._id) === id);
    if (found) return (<li key={i}>{found.name || found.username || found.email}</li>);
    try { if (id.startsWith('{')||id.startsWith('[')) { const parsed = JSON.parse(id); if (parsed && typeof parsed === 'object') return (<li key={i}>{parsed.name || parsed.email || JSON.stringify(parsed)}</li>); } } catch(e){}
    if (id.includes(',') || id.includes(';')) {
      const first = id.split(/[,;]+/)[0].replace(/^\"|\"$/g, '').trim();
      if (first) return (<li key={i}>{first}</li>);
    }
    const emailMatch = id.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch) return (<li key={i}>{emailMatch[0]}</li>);
    return (<li key={i}>{id.length > 60 ? id.slice(0,60) + '...' : id}</li>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-xl p-6 z-50 w-full max-w-2xl overflow-auto max-h-[80vh]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Team: {team.name || 'Unnamed'}</h3>
            <p className="text-sm text-gray-500">ID: <span className="font-mono">{String(team._id || team.id || '').slice(-12)}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded border"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="w-full h-48 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              {team.image ? <img src={getImageUrl(team.image)} alt={team.name} className="w-full h-full object-cover" /> : <div className="text-gray-400">No image</div>}
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <div><strong>Members:</strong></div>
              <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                {(!team.members || team.members.length === 0) ? (<li>-</li>) : team.members.map(renderMember)}
              </ul>
            </div>
          </div>

          <div className="col-span-2">
            <div className="mb-3">
              <h4 className="font-semibold">Details</h4>
              <div className="mt-2 text-sm text-gray-700">
                <table className="w-full text-sm">
                  <tbody>
                    <tr><td className="font-medium py-1">Name</td><td className="py-1">{team.name || '-'}</td></tr>
                    <tr><td className="font-medium py-1">Created</td><td className="py-1">{team.createdAt ? new Date(team.createdAt).toLocaleString() : '-'}</td></tr>
                    <tr><td className="font-medium py-1">Updated</td><td className="py-1">{team.updatedAt ? new Date(team.updatedAt).toLocaleString() : '-'}</td></tr>
                    <tr><td className="font-medium py-1">Members count</td><td className="py-1">{Array.isArray(team.members) ? team.members.length : (team.members ? String(team.members).split(',').filter(Boolean).length : 0)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">Attachments</h4>
              <div className="mt-2">
                {team.files && team.files.length > 0 ? (
                  <ul className="list-disc ml-5 text-sm">
                    {team.files.map((f, idx) => (
                      <li key={idx} className="mb-1">
                        <a className="text-blue-600 hover:underline" href={getImageUrl(f)} target="_blank" rel="noreferrer">{(String(f).split('/').pop() || `file-${idx}`)}</a>
                      </li>
                    ))}
                  </ul>
                ) : (<p className="text-sm text-gray-500">No attachments</p>)}
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold">Raw</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded max-h-40 overflow-auto">{JSON.stringify(team, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsModal;
