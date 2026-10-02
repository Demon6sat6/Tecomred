import { useState, useEffect } from 'react';
import { Check, Plus, Save, Trash2, Users } from 'lucide-react';
import { useAdmin, type AboutPerson } from '../../context/AdminContext';
import { adminAlert } from '../../utils/adminAlerts';

export default function AdminAbout() {
  const { settings, saveSettings } = useAdmin();
  const [mission, setMission] = useState(settings.aboutMission || '');
  const [vision, setVision] = useState(settings.aboutVision || '');
  const [team, setTeam] = useState<AboutPerson[]>(settings.aboutTeam ?? []);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // The settings arrive asynchronously from the server; hydrate the editable draft once they change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (settings.aboutMission !== undefined) setMission(settings.aboutMission);
    if (settings.aboutVision !== undefined) setVision(settings.aboutVision);
    if (settings.aboutTeam !== undefined) setTeam(settings.aboutTeam);
  }, [settings.aboutMission, settings.aboutVision, settings.aboutTeam]);

  const updatePerson = (index: number, field: keyof AboutPerson, value: string) => {
    setTeam(current => current.map((person, i) => i === index ? { ...person, [field]: value } : person));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await saveSettings({ ...settings, aboutMission: mission, aboutVision: vision, aboutTeam: team });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      void adminAlert.success('Contenido guardado');
    } else {
      void adminAlert.error('No se pudo guardar el contenido. Revisa la conexión con el servidor.');
    }
  };

  return (
    <form onSubmit={save} className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Nosotros</h2>
        <p className="text-slate-500 text-sm mt-1">Edita la misión, visión y las personas que aparecen en la página Nosotros.</p>
      </div>

      <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-slate-900 font-bold">Misión y visión</h3>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Misión</label>
          <textarea value={mission} onChange={event => setMission(event.target.value)} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 resize-y" />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Visión</label>
          <textarea value={vision} onChange={event => setVision(event.target.value)} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 resize-y" />
        </div>
      </section>

      <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-slate-900 font-bold">Equipo</h3><p className="text-slate-500 text-xs mt-1">Nombre, cargo e imagen de cada persona.</p></div>
          <button type="button" onClick={() => setTeam(current => [...current, { name: '', role: '', image: '' }])} className="min-h-[42px] px-3 rounded-xl gradient-brand text-white text-sm font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Agregar</button>
        </div>
        <div className="space-y-4">
          {team.map((person, index) => (
            <div key={index} className="grid border border-slate-200 bg-slate-50/50 rounded-xl p-4 grid-cols-1 md:grid-cols-[72px_1fr_1fr_1fr_auto] gap-3 items-end">
              <div className="md:row-span-1"><label className="block text-xs text-slate-500 mb-1">Foto</label>{person.image ? <img src={person.image} alt="Vista previa" className="w-16 h-16 rounded-full object-cover border border-slate-200" /> : <div className="w-16 h-16 rounded-full bg-slate-200" />}</div>
              <label className="block text-xs text-slate-600">Nombre<input value={person.name} onChange={event => updatePerson(index, 'name', event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm" placeholder="Nombre completo" /></label>
              <label className="block text-xs text-slate-600">Cargo<input value={person.role} onChange={event => updatePerson(index, 'role', event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm" placeholder="Cargo" /></label>
              <label className="block text-xs text-slate-600">URL de imagen<input value={person.image} onChange={event => updatePerson(index, 'image', event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm" placeholder="https://..." /></label>
              <button type="button" onClick={() => setTeam(current => current.filter((_, i) => i !== index))} className="min-h-[42px] px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100" aria-label={`Eliminar ${person.name || 'persona'}`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <button type="submit" className={`min-h-[46px] px-5 rounded-xl text-white font-bold flex items-center gap-2 ${saved ? 'bg-emerald-500' : 'gradient-brand'}`}>{saved ? <><Check className="w-5 h-5" /> Guardado</> : <><Save className="w-5 h-5" /> Guardar cambios</>}</button>
    </form>
  );
}
