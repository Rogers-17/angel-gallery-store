export function AnnouncementBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ink text-paper">
      <p className="eyebrow container-page py-2.5 text-center">{children}</p>
    </div>
  );
}
