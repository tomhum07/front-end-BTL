import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[350px] md:h-[400px] flex items-center justify-center text-white">
      <Image
        // src="/Cầu_Cao_Lãnh.jpg"
        src="/cau-cao-lanh-2.jpg"
        alt="Hero"
        fill
        priority
        className="object-cover object-center"
        quality={75}
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative text-center z-10">
        <h1 className="text-5xl font-bold">Phường Cao Lãnh</h1>
        <p className="mt-4 text-lg">Trang giới thiệu Phường Cao Lãnh</p>
      </div>
    </section>
  );
}
