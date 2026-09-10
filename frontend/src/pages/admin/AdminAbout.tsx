import { useState } from 'react';
import { Check, Plus, Save, Trash2, Users } from 'lucide-react';
import { useAdmin, type AboutPerson } from '../../context/AdminContext';

export default function AdminAbout() {
  const { settings, saveSettings } = useAdmin();
  const [mission, setMission] = useState(settings.aboutMission || 'Brindar soluciones tecnológicas de red confiables y accesibles para empresas y hogares del Perú.');
  const [vision, setVision] = useState(settings.aboutVision || 'Ser la tienda líder en equipos de redes y tecnología en la región, reconocida por calidad y servicio.');
  const [team, setTeam] = useState<AboutPerson[]>(settings.aboutTeam?.length ? settings.aboutTeam : [
    { name: 'Carlos Mendoza', role: 'Gerente General', image: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Lucía Torres', role: 'Jefa de Ventas', image: 'https://i.pravatar.cc/150?img=47' },
    { name: 'Miguel Ríos', role: 'Soporte Técnico', image: 'https://i.pravatar.cc/150?img=15' },
    { name: 'Ana Paredes', role: 'Atención al Cliente', image: 'https://i.pravatar.cc/150?img=45' },
  ]);
  const [saved, setSaved] = useState(false);

  const updatePerson = (index: number, field: keyof AboutPerson, value: string) => {
    setTeam(current => current.map((person, i) => i === index ? { ...person, [field]: value } : person));
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    saveSettings({ ...settings, aboutMission: mission, aboutVision: vision, aboutTeam: team });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={save} className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2"><Users className="w-6 h-6 text-sky-400" /> Nosotros</h2>
        <p className="text-gray-500 text-sm mt-1">Edita la misión, visión y las personas que aparecen en la página Nosotros.</p>
      </div>

      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-white font-bold">Misión y visión</h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Misión</label>
          <textarea value={mission} onChange={event => setMission(event.target.value)} rows={4} className="w-full px-4 py-3 bg-gray-800 border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60 resize-y" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Visión</label>
          <textarea value={vision} onChange={event => setVision(event.target.value)} rows={4} className="w-full px-4 py-3 bg-gray-800 border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60 resize-y" />
        </div>
      </section>

      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-white font-bold">Equipo</h3><p className="text-gray-500 text-xs mt-1">Nombre, cargo e imagen de cada persona.</p></div>
          <button type="button" onClick={() => setTeam(current => [...current, { name: '', role: '', image: '' }])} className="min-h-[42px] px-3 rounded-xl gradient-brand text-white text-sm font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Agregar</button>
        </div>
        <div className="space-y-4">
          {team.map((person, index) => (
            <div key={index} className="border border-white/10 rounded-xl p-4 grid-cols-1 md:grid-cols-[72px_1fr_1fr_1fr_auto] gap-3 items-end">
              <div className="md:row-span-1"><label className="block text-xs text-gray-500 mb-1">Foto</label>{person.image ? <img src={person.image} alt="Vista previa" className="w-16 h-16 rounded-full object-cover border-white/10" /> : <div className="w-16 h-16 rounded-full bg-gray-800" />}</div>
              <label className="block text-xs text-gray-400">Nombre<input value={person.name} onChange={event => updatePerson(index, 'name', event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-gray-800 border-white/10 rounded-lg text-gray-200 text-sm" placeholder="Nombre completo" /></label>
              <label className="block text-xs text-gray-400">Cargo<input value={person.role} onChange={event => updatePerson(index, 'role', event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-gray-800 border-white/10 rounded-lg text-gray-200 text-sm" placeholder="Cargo" /></label>
              <label className="block text-xs text-gray-400">URL de imagen<input value={person.image} onChange={event => updatePerson(index, 'image', event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-gray-800 border-white/10 rounded-lg text-gray-200 text-sm" placeholder="https://..." /></label>
              <button type="button" onClick={() => setTeam(current => current.filter((_, i) => i !== index))} className="min-h-[42px] px-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30" aria-label={`Eliminar ${person.name || 'persona'}`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <button type="submit" className={`min-h-[46px] px-5 rounded-xl text-white font-bold flex items-center gap-2 ${saved ? 'bg-emerald-500' : 'gradient-brand'}`}>{saved ? <><Check className="w-5 h-5" /> Guardado</> : <><Save className="w-5 h-5" /> Guardar cambios</>}</button>
    </form>
  );
}
