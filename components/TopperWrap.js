import "tailwindcss/tailwind.css";

export default function TopperWrap({children}){

    return <div className="w-full flex flex-col justify-start items-stretch mb-4 relative">{children}
    <p className="bg-secondary rounded-b-lg flex flex-col items-center justify-center z-10 -bottom-[10px] text-sm left-4 absolute w-[200px]   text-black ">IPM Careers Student</p>
    </div>
}