"use client";
import { useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Dr. Hana",
    title: "Cardiologist, Addis Ababa",
    image: "/avatar1.jpg",
    message:
      "Medanit’s predictive engine has changed the way I discuss diagnoses with patients. The UI feels compassionate and smart.",
  },
  {
    name: "Yared M.",
    title: "Patient, Bahir Dar",
    image: "/avatar2.jpg",
    message:
      "After submitting symptoms, the results felt personal — not robotic. Medanit helped me feel heard, not just diagnosed.",
  },
  {
    name: "Selam A.",
    title: "Medical Staff, Gondar",
    image: "/avatar3.jpg",
    message:
      "Finally, an AI platform that values clarity and emotional design. Medanit makes my workflow smoother and more trustworthy.",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(1); // center card

  const handleClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className="w-full bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">What People Are Saying</h2>
        <p className="text-gray-600 text-lg">Trusted by professionals and patients across Ethiopia.</p>
      </div>

      <div className="flex justify-center items-center gap-6 overflow-hidden">
        {testimonials.map((t, index) => {
          const isActive = index === activeIndex;
          const isLeft = index === (activeIndex - 1 + testimonials.length) % testimonials.length;
          const isRight = index === (activeIndex + 1) % testimonials.length;

          return (
            <div
              key={index}
              onClick={() => handleClick(index)}
              className={`cursor-pointer transition-all duration-500 ease-in-out transform ${
                isActive
                  ? "scale-100 opacity-100 z-20"
                  : isLeft || isRight
                  ? "scale-90 opacity-60 z-10"
                  : "hidden"
              } bg-sky-50 rounded-xl shadow-lg p-6 w-[300px] md:w-[340px] hover:shadow-xl`}
            >
              <div className="flex flex-col items-center text-center">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={72}
                  height={72}
                  className="rounded-full mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800">{t.name}</h3>
                <p className="text-sm text-sky-600 mb-4">{t.title}</p>
                <p className="text-gray-700 text-base leading-relaxed italic">“{t.message}”</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Testimonials;