import { useId } from 'react';
export interface TabItem { id: string; label: string }
export function Tabs({ items, active, onChange }: { items: TabItem[]; active: string; onChange: (id: string) => void }) { const id = useId(); return <div className="tabs" role="tablist" aria-label="ניווט תוכן">{items.map((item) => <button id={`${id}-${item.id}`} key={item.id} role="tab" aria-selected={active === item.id} className={active === item.id ? 'active' : ''} onClick={() => onChange(item.id)}>{item.label}</button>)}</div>; }
