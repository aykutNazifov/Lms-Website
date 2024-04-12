import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto px-10">

      <div className="h-[calc(100vh-6rem)] flex items-center">
        <div className="flex-1">Imagee</div>
        <div className="flex-1">
          <h1 className="text-bold text-5xl font-Josefin mb-10">LMS platform</h1>
          <p className="text-2xl leading-8 mb-4">Lorem ipsum dolor sit <span className="text-green-900 dark:text-green-400 font-bold">amet</span> amet consectetur adipisicing elit. Voluptates distinctio <span className="text-green-900 dark:text-green-400 font-bold">aspernatur</span> quis repellat reprehenderit laudantium tenetur necessitatibus dicta aliquam odio.</p>
          <Input type="text" placeholder="Search course..." />
        </div>
      </div>
    </div>
  );
}
