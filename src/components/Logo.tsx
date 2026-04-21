export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "text-xl", md: "text-3xl", lg: "text-6xl md:text-7xl" }[size];
  return (
    <div className={`font-display font-black ${sizes} tracking-widest leading-none`}>
      <span className="text-foreground">AIM</span>
      <span className="text-hud">STRIKE</span>
    </div>
  );
};