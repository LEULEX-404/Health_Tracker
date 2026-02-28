const doctors = [
    {
        id: 1,
        name: "Dr. Sarah Jenkins",
        specialty: "Cardiologist",
        experience: "12 yrs exp.",
        location: "Metro Heart Institute, NY",
        rating: 4.9,
        fee: 120,
        availableSlots: ["02:00 PM", "04:30 PM", "05:15 PM"],
        image: "https://i.pravatar.cc/150?img=5"
    },
    {
        id: 2,
        name: "Dr. Marcus Chen",
        specialty: "General Physician",
        experience: "8 yrs exp.",
        location: "City Wellness Clinic, SF",
        rating: 4.8,
        fee: 85,
        availableSlots: ["10:00 AM"],
        image: "https://i.pravatar.cc/150?img=11"
    },
    {
        id: 3,
        name: "Dr. Elena Rodriguez",
        specialty: "Dermatologist",
        experience: "10 yrs exp.",
        location: "Skin Care Central, LA",
        rating: 5.0,
        fee: 150,
        availableSlots: ["04:30 PM", "06:00 PM"],
        image: "https://i.pravatar.cc/150?img=9"
    },
    {
        id: 4,
        name: "Dr. James Wilson",
        specialty: "Neurologist",
        experience: "15 yrs exp.",
        location: "Brain Health Center, CHI",
        rating: 4.7,
        fee: 200,
        availableSlots: ["Mon, 09:00 AM"],
        image: "https://i.pravatar.cc/150?img=8"
    },
    {
        id: 5,
        name: "Dr. Priya Sharma",
        specialty: "Pediatrician",
        experience: "9 yrs exp.",
        location: "Children's Health Hub, Boston",
        rating: 4.9,
        fee: 95,
        availableSlots: ["11:00 AM", "03:00 PM", "04:00 PM"],
        image: "https://i.pravatar.cc/150?img=1"
    },
    {
        id: 6,
        name: "Dr. David Kim",
        specialty: "Orthopedic Surgeon",
        experience: "14 yrs exp.",
        location: "Sports Medicine Center, Denver",
        rating: 4.8,
        fee: 180,
        availableSlots: ["09:30 AM", "02:30 PM"],
        image: "https://i.pravatar.cc/150?img=12"
    },
    {
        id: 7,
        name: "Dr. Amanda Foster",
        specialty: "Psychiatrist",
        experience: "11 yrs exp.",
        location: "Mind Wellness Clinic, Seattle",
        rating: 5.0,
        fee: 175,
        availableSlots: ["10:00 AM", "01:00 PM", "05:00 PM"],
        image: "https://i.pravatar.cc/150?img=16"
    },
    {
        id: 8,
        name: "Dr. Robert Hayes",
        specialty: "Cardiologist",
        experience: "18 yrs exp.",
        location: "Cardiac Care Associates, Miami",
        rating: 4.9,
        fee: 220,
        availableSlots: ["08:00 AM", "11:30 AM", "03:00 PM"],
        image: "https://i.pravatar.cc/150?img=13"
    },
    {
        id: 9,
        name: "Dr. Michelle Park",
        specialty: "Dermatologist",
        experience: "7 yrs exp.",
        location: "Glow Dermatology, Austin",
        rating: 4.7,
        fee: 140,
        availableSlots: ["02:00 PM", "04:00 PM", "05:30 PM"],
        image: "https://i.pravatar.cc/150?img=20"
    },
    {
        id: 10,
        name: "Dr. Thomas Wright",
        specialty: "Neurologist",
        experience: "16 yrs exp.",
        location: "Neuro Care Institute, Phoenix",
        rating: 4.8,
        fee: 195,
        availableSlots: ["Mon, 10:00 AM", "Wed, 02:00 PM"],
        image: "https://i.pravatar.cc/150?img=15"
    },
    {
        id: 11,
        name: "Dr. Jennifer Lee",
        specialty: "Obstetrician",
        experience: "10 yrs exp.",
        location: "Women's Health Center, Atlanta",
        rating: 4.9,
        fee: 160,
        availableSlots: ["09:00 AM", "12:00 PM", "04:30 PM"],
        image: "https://i.pravatar.cc/150?img=23"
    },
    {
        id: 12,
        name: "Dr. Michael Torres",
        specialty: "General Physician",
        experience: "6 yrs exp.",
        location: "Family First Medical, Portland",
        rating: 4.6,
        fee: 80,
        availableSlots: ["08:00 AM", "01:00 PM"],
        image: "https://i.pravatar.cc/150?img=14"
    },
    {
        id: 13,
        name: "Dr. Rachel Green",
        specialty: "Pediatrician",
        experience: "12 yrs exp.",
        location: "Little Stars Pediatrics, Nashville",
        rating: 5.0,
        fee: 100,
        availableSlots: ["11:30 AM", "02:00 PM", "03:30 PM"],
        image: "https://i.pravatar.cc/150?img=25"
    },
    {
        id: 14,
        name: "Dr. Kevin Patel",
        specialty: "Orthopedics",
        experience: "13 yrs exp.",
        location: "Bone & Joint Clinic, Dallas",
        rating: 4.8,
        fee: 170,
        availableSlots: ["10:00 AM", "04:00 PM"],
        image: "https://i.pravatar.cc/150?img=33"
    },
    {
        id: 15,
        name: "Dr. Lisa Martinez",
        specialty: "Cardiologist",
        experience: "11 yrs exp.",
        location: "Heart & Vascular Center, Houston",
        rating: 4.9,
        fee: 130,
        availableSlots: ["08:30 AM", "12:30 PM", "05:00 PM"],
        image: "https://i.pravatar.cc/150?img=26"
    },
    {
        id: 16,
        name: "Dr. Andrew Clark",
        specialty: "Dermatology",
        experience: "9 yrs exp.",
        location: "Clear Skin Clinic, San Diego",
        rating: 4.7,
        fee: 145,
        availableSlots: ["01:00 PM", "03:00 PM", "06:00 PM"],
        image: "https://i.pravatar.cc/150?img=32"
    },
    {
        id: 17,
        name: "Dr. Sophia Nguyen",
        specialty: "Neurology",
        experience: "14 yrs exp.",
        location: "Pacific Neuro Center, Oakland",
        rating: 4.9,
        fee: 210,
        availableSlots: ["Tue, 09:00 AM", "Thu, 02:00 PM"],
        image: "https://i.pravatar.cc/150?img=28"
    },
    {
        id: 18,
        name: "Dr. Daniel Brown",
        specialty: "Psychiatrist",
        experience: "8 yrs exp.",
        location: "Calm Mind Therapy, Chicago",
        rating: 4.8,
        fee: 165,
        availableSlots: ["10:30 AM", "02:00 PM", "04:00 PM"],
        image: "https://i.pravatar.cc/150?img=34"
    },
    {
        id: 19,
        name: "Dr. Emily Watson",
        specialty: "Pediatrics",
        experience: "7 yrs exp.",
        location: "Happy Kids Medical, Minneapolis",
        rating: 4.9,
        fee: 90,
        availableSlots: ["09:00 AM", "11:00 AM", "03:00 PM"],
        image: "https://i.pravatar.cc/150?img=30"
    },
    {
        id: 20,
        name: "Dr. Christopher Moore",
        specialty: "General Physician",
        experience: "15 yrs exp.",
        location: "Downtown Health Clinic, DC",
        rating: 4.8,
        fee: 95,
        availableSlots: ["08:00 AM", "12:00 PM", "05:30 PM"],
        image: "https://i.pravatar.cc/150?img=38"
    },
    {
        id: 21,
        name: "Dr. Natalie Brooks",
        specialty: "Cardiologist",
        experience: "10 yrs exp.",
        location: "Valley Heart Clinic, Phoenix",
        rating: 4.9,
        fee: 125,
        availableSlots: ["09:00 AM", "01:00 PM", "04:00 PM"],
        image: "https://i.pravatar.cc/150?img=41"
    },
    {
        id: 22,
        name: "Dr. Ryan Mitchell",
        specialty: "Dermatologist",
        experience: "8 yrs exp.",
        location: "Derm Solutions, Tampa",
        rating: 4.7,
        fee: 135,
        availableSlots: ["11:00 AM", "02:30 PM", "05:00 PM"],
        image: "https://i.pravatar.cc/150?img=42"
    },
    {
        id: 23,
        name: "Dr. Olivia Carter",
        specialty: "Pediatrician",
        experience: "11 yrs exp.",
        location: "Sunshine Pediatrics, Orlando",
        rating: 5.0,
        fee: 92,
        availableSlots: ["08:30 AM", "12:00 PM", "03:30 PM"],
        image: "https://i.pravatar.cc/150?img=43"
    },
    {
        id: 24,
        name: "Dr. Brandon Lee",
        specialty: "Neurologist",
        experience: "17 yrs exp.",
        location: "Advanced Neuro Care, Boston",
        rating: 4.8,
        fee: 205,
        availableSlots: ["Mon, 11:00 AM", "Fri, 09:00 AM"],
        image: "https://i.pravatar.cc/150?img=44"
    },
    {
        id: 25,
        name: "Dr. Hannah Reed",
        specialty: "Orthopedics",
        experience: "9 yrs exp.",
        location: "Peak Performance Ortho, Denver",
        rating: 4.8,
        fee: 165,
        availableSlots: ["10:00 AM", "02:00 PM"],
        image: "https://i.pravatar.cc/150?img=45"
    },
    {
        id: 26,
        name: "Dr. Nathan Scott",
        specialty: "General Physician",
        experience: "12 yrs exp.",
        location: "Community Health, Cleveland",
        rating: 4.7,
        fee: 88,
        availableSlots: ["09:00 AM", "02:00 PM"],
        image: "https://i.pravatar.cc/150?img=46"
    },
    {
        id: 27,
        name: "Dr. Victoria Adams",
        specialty: "Psychiatrist",
        experience: "13 yrs exp.",
        location: "Serenity Mental Health, San Jose",
        rating: 4.9,
        fee: 180,
        availableSlots: ["10:30 AM", "01:30 PM", "04:30 PM"],
        image: "https://i.pravatar.cc/150?img=47"
    },
    {
        id: 28,
        name: "Dr. Justin Turner",
        specialty: "Cardiologist",
        experience: "14 yrs exp.",
        location: "Heart Wellness Group, Detroit",
        rating: 4.9,
        fee: 140,
        availableSlots: ["08:00 AM", "11:00 AM", "03:00 PM"],
        image: "https://i.pravatar.cc/150?img=48"
    },
    {
        id: 29,
        name: "Dr. Isabella Garcia",
        specialty: "Dermatology",
        experience: "6 yrs exp.",
        location: "Radiant Skin Studio, Miami",
        rating: 4.8,
        fee: 155,
        availableSlots: ["01:00 PM", "03:30 PM", "06:00 PM"],
        image: "https://i.pravatar.cc/150?img=49"
    },
    {
        id: 30,
        name: "Dr. Tyler Phillips",
        specialty: "Pediatrics",
        experience: "8 yrs exp.",
        location: "First Steps Pediatric Care, Charlotte",
        rating: 4.9,
        fee: 85,
        availableSlots: ["09:30 AM", "11:30 AM", "02:00 PM"],
        image: "https://i.pravatar.cc/150?img=50"
    },
    {
        id: 31,
        name: "Dr. Rebecca Collins",
        specialty: "Cardiologist",
        experience: "13 yrs exp.",
        location: "Summit Cardiac Institute, Denver",
        rating: 4.9,
        fee: 145,
        availableSlots: ["09:00 AM", "11:00 AM", "02:30 PM"],
        image: "https://i.pravatar.cc/150?img=51"
    },
   
];

const SPECIALIST_IMAGE_PATHS = [
    '/specialists/doctor-01.png', '/specialists/doctor-02.png', '/specialists/doctor-03.png',
    '/specialists/doctor-04.png', '/specialists/doctor-05.png', '/specialists/doctor-06.png',
    '/specialists/doctor-07.png', '/specialists/doctor-08.png', '/specialists/doctor-09.png',
    '/specialists/doctor-10.png', '/specialists/doctor-11.png', '/specialists/doctor-12.png',
    '/specialists/doctor-13.png', '/specialists/doctor-14.png', '/specialists/doctor-15.png'
]
export const getDoctors = (req, res) => {
    const list = doctors.map((d, i) => ({ ...d, image: SPECIALIST_IMAGE_PATHS[i % SPECIALIST_IMAGE_PATHS.length] }));
    res.json(list);
};

export default {
    getDoctors
};
