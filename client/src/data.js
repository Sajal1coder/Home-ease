import { TbBeach, TbMountain, TbPool } from "react-icons/tb";
import {
  GiBarn,
  GiBoatFishing,
  GiCactus,
  GiCastle,
  GiCaveEntrance,
  GiForestCamp,
  GiIsland,
  GiWindmill,
} from "react-icons/gi";
import {
  FaSkiing,
  FaPumpSoap,
  FaShower,
  FaFireExtinguisher,
  FaUmbrellaBeach,
  FaKey,
} from "react-icons/fa";
import { FaHouseUser, FaPeopleRoof, FaKitchenSet } from "react-icons/fa6";
import {
  BiSolidWasher,
  BiSolidDryer,
  BiSolidFirstAid,
  BiWifi,
  BiSolidFridge,
  BiWorld,
} from "react-icons/bi";
import { BsSnow, BsFillDoorOpenFill, BsPersonWorkspace } from "react-icons/bs";
import { IoDiamond } from "react-icons/io5";
import { MdOutlineVilla, MdMicrowave, MdBalcony, MdYard, MdPets } from "react-icons/md";
import {
  PiBathtubFill,
  PiCoatHangerFill,
  PiTelevisionFill,
} from "react-icons/pi";
import { TbIroning3 } from "react-icons/tb";
import {
  GiHeatHaze,
  GiCctvCamera,
  GiBarbecue,
  GiToaster,
  GiCampfire,
} from "react-icons/gi";
import { AiFillCar } from "react-icons/ai";

export const categories = [
  
  {
    img: "assets/mumbai.jpg",
    label: "Mumbai",
    description: "This property is close to the Mumbai!",
  },
  {
    img: "assets/delhi.webp",
    label: "Delhi",
    description: "This property is has windmills!",
  },
  {
    img: "assets/kolkata.jpeg",
    label: "Kolkata",
    description: "This property is modern!",
  },
  {
    img: "assets/bangluru.jpeg",
    label: "Banglore",
    description: "This property is in the countryside!",
  },
  {
    img: "assets/lucknow.jpeg",
    label: "Lucknow",
    description: "This is property has a beautiful pool!",
  },
  {
    img: "assets/hyderabad.jpeg",
    label: "Hydrabad",
    description: "This property is on an island!",
  },
  {
    img: "assets/pune.jpeg",
    label: "Pune",
    description: "This property is near a lake!",
  },
  {
    img: "assets/chennai.jpeg",
    label: "Chennai",
   
    description: "This property has skiing activies!",
  },
  {
    img: "assets/ahmedabad.jpg",
    label: "Ahmedabad",
    
    description: "This property is an ancient castle!",
  },
  {
    img: "assets/chandigarh.jpeg",
    label: "Chandigarh",
    
    description: "This property is in a spooky cave!",
  },
  {
    img: "assets/bhopal.jpeg",
    label: "Bhopal",
    
    description: "This property offers camping activities!",
  },
  {
    img: "assets/guwahati.webp",
    label: "Guwahati",
  
    description: "This property is in arctic environment!",
  },
  {
    img: "assets/jaipur.jpeg",
    label: "Jaipur",
   
    description: "This property is in the desert!",
  },
  {
    img: "assets/surat.avif",
    label: "Surat",
   
    description: "This property is in a barn!",
  },
  {
    img: "assets/varanasi.jpg",
    label: "Varanasi",
   
    description: "This property is brand new and luxurious!",
  },
  {
    label: "Any Other",
    icon: <BiWorld />,
    img:"assets/null.jpeg"
  },
];

export const types = [
  {
    name: "An entire place",
    description: "Guests have the whole place to themselves",
    icon: <FaHouseUser />,
  },
  {
    name: "Room(s)",
    description:
      "Guests have their own room in a house, plus access to shared places",
    icon: <BsFillDoorOpenFill />,
  },
  {
    name: "A Shared Room",
    description:
      "Guests sleep in a room or common area that maybe shared with you or others",
    icon: <FaPeopleRoof />,
  },
];

export const facilities = [
  {
    name: "Bath tub",
    icon: <PiBathtubFill />,
  },
  {
    name: "Personal care products",
    icon: <FaPumpSoap />,
  },
  {
    name: "Outdoor shower",
    icon: <FaShower />,
  },
  {
    name: "Washer",
    icon: <BiSolidWasher />,
  },
  {
    name: "Dryer",
    icon: <BiSolidDryer />,
  },
  {
    name: "Hangers",
    icon: <PiCoatHangerFill />,
  },
  {
    name: "Iron",
    icon: <TbIroning3 />,
  },
  {
    name: "TV",
    icon: <PiTelevisionFill />,
  },
  {
    name: "Dedicated workspace",
    icon: <BsPersonWorkspace />
  },
  {
    name: "Air Conditioning",
    icon: <BsSnow />,
  },
  {
    name: "Heating",
    icon: <GiHeatHaze />,
  },
  {
    name: "Security cameras",
    icon: <GiCctvCamera />,
  },
  {
    name: "Fire extinguisher",
    icon: <FaFireExtinguisher />,
  },
  {
    name: "First Aid",
    icon: <BiSolidFirstAid />,
  },
  {
    name: "Wifi",
    icon: <BiWifi />,
  },
  {
    name: "Cooking set",
    icon: <FaKitchenSet />,
  },
  {
    name: "Refrigerator",
    icon: <BiSolidFridge />,
  },
  {
    name: "Microwave",
    icon: <MdMicrowave />,
  },
  {
    name: "Stove",
    icon: <GiToaster />,
  },
  {
    name: "Barbecue grill",
    icon: <GiBarbecue />,
  },
  {
    name: "Outdoor dining area",
    icon: <FaUmbrellaBeach />,
  },
  {
    name: "Private patio or Balcony",
    icon: <MdBalcony />,
  },
  {
    name: "Camp fire",
    icon: <GiCampfire />,
  },
  {
    name: "Garden",
    icon: <MdYard />,
  },
  {
    name: "Free parking",
    icon: <AiFillCar />,
  },
  {
    name: "Self check-in",
    icon: <FaKey />
  },
  {
    name: " Pet allowed",
    icon: <MdPets />
  }
];