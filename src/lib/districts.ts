export const DIVISIONS = [
	'barishal',
	'chattogram',
	'dhaka',
	'khulna',
	'mymensingh',
	'rajshahi',
	'rangpur',
	'sylhet'
] as const;
export type Division = (typeof DIVISIONS)[number];

export interface District {
	/** Stable slug; stored on orders and addresses, never change it. */
	id: string;
	en: string;
	bn: string;
	division: Division;
}

/** The 64 districts of Bangladesh, grouped by division. */
export const DISTRICTS: readonly District[] = [
	{ id: 'barguna', en: 'Barguna', bn: 'বরগুনা', division: 'barishal' },
	{ id: 'barishal', en: 'Barishal', bn: 'বরিশাল', division: 'barishal' },
	{ id: 'bhola', en: 'Bhola', bn: 'ভোলা', division: 'barishal' },
	{ id: 'jhalokati', en: 'Jhalokati', bn: 'ঝালকাঠি', division: 'barishal' },
	{ id: 'patuakhali', en: 'Patuakhali', bn: 'পটুয়াখালী', division: 'barishal' },
	{ id: 'pirojpur', en: 'Pirojpur', bn: 'পিরোজপুর', division: 'barishal' },

	{ id: 'bandarban', en: 'Bandarban', bn: 'বান্দরবান', division: 'chattogram' },
	{ id: 'brahmanbaria', en: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', division: 'chattogram' },
	{ id: 'chandpur', en: 'Chandpur', bn: 'চাঁদপুর', division: 'chattogram' },
	{ id: 'chattogram', en: 'Chattogram', bn: 'চট্টগ্রাম', division: 'chattogram' },
	{ id: 'coxs-bazar', en: "Cox's Bazar", bn: 'কক্সবাজার', division: 'chattogram' },
	{ id: 'cumilla', en: 'Cumilla', bn: 'কুমিল্লা', division: 'chattogram' },
	{ id: 'feni', en: 'Feni', bn: 'ফেনী', division: 'chattogram' },
	{ id: 'khagrachhari', en: 'Khagrachhari', bn: 'খাগড়াছড়ি', division: 'chattogram' },
	{ id: 'lakshmipur', en: 'Lakshmipur', bn: 'লক্ষ্মীপুর', division: 'chattogram' },
	{ id: 'noakhali', en: 'Noakhali', bn: 'নোয়াখালী', division: 'chattogram' },
	{ id: 'rangamati', en: 'Rangamati', bn: 'রাঙ্গামাটি', division: 'chattogram' },

	{ id: 'dhaka', en: 'Dhaka', bn: 'ঢাকা', division: 'dhaka' },
	{ id: 'faridpur', en: 'Faridpur', bn: 'ফরিদপুর', division: 'dhaka' },
	{ id: 'gazipur', en: 'Gazipur', bn: 'গাজীপুর', division: 'dhaka' },
	{ id: 'gopalganj', en: 'Gopalganj', bn: 'গোপালগঞ্জ', division: 'dhaka' },
	{ id: 'kishoreganj', en: 'Kishoreganj', bn: 'কিশোরগঞ্জ', division: 'dhaka' },
	{ id: 'madaripur', en: 'Madaripur', bn: 'মাদারীপুর', division: 'dhaka' },
	{ id: 'manikganj', en: 'Manikganj', bn: 'মানিকগঞ্জ', division: 'dhaka' },
	{ id: 'munshiganj', en: 'Munshiganj', bn: 'মুন্সীগঞ্জ', division: 'dhaka' },
	{ id: 'narayanganj', en: 'Narayanganj', bn: 'নারায়ণগঞ্জ', division: 'dhaka' },
	{ id: 'narsingdi', en: 'Narsingdi', bn: 'নরসিংদী', division: 'dhaka' },
	{ id: 'rajbari', en: 'Rajbari', bn: 'রাজবাড়ী', division: 'dhaka' },
	{ id: 'shariatpur', en: 'Shariatpur', bn: 'শরীয়তপুর', division: 'dhaka' },
	{ id: 'tangail', en: 'Tangail', bn: 'টাঙ্গাইল', division: 'dhaka' },

	{ id: 'bagerhat', en: 'Bagerhat', bn: 'বাগেরহাট', division: 'khulna' },
	{ id: 'chuadanga', en: 'Chuadanga', bn: 'চুয়াডাঙ্গা', division: 'khulna' },
	{ id: 'jashore', en: 'Jashore', bn: 'যশোর', division: 'khulna' },
	{ id: 'jhenaidah', en: 'Jhenaidah', bn: 'ঝিনাইদহ', division: 'khulna' },
	{ id: 'khulna', en: 'Khulna', bn: 'খুলনা', division: 'khulna' },
	{ id: 'kushtia', en: 'Kushtia', bn: 'কুষ্টিয়া', division: 'khulna' },
	{ id: 'magura', en: 'Magura', bn: 'মাগুরা', division: 'khulna' },
	{ id: 'meherpur', en: 'Meherpur', bn: 'মেহেরপুর', division: 'khulna' },
	{ id: 'narail', en: 'Narail', bn: 'নড়াইল', division: 'khulna' },
	{ id: 'satkhira', en: 'Satkhira', bn: 'সাতক্ষীরা', division: 'khulna' },

	{ id: 'jamalpur', en: 'Jamalpur', bn: 'জামালপুর', division: 'mymensingh' },
	{ id: 'mymensingh', en: 'Mymensingh', bn: 'ময়মনসিংহ', division: 'mymensingh' },
	{ id: 'netrokona', en: 'Netrokona', bn: 'নেত্রকোণা', division: 'mymensingh' },
	{ id: 'sherpur', en: 'Sherpur', bn: 'শেরপুর', division: 'mymensingh' },

	{ id: 'bogura', en: 'Bogura', bn: 'বগুড়া', division: 'rajshahi' },
	{ id: 'chapai-nawabganj', en: 'Chapai Nawabganj', bn: 'চাঁপাইনবাবগঞ্জ', division: 'rajshahi' },
	{ id: 'joypurhat', en: 'Joypurhat', bn: 'জয়পুরহাট', division: 'rajshahi' },
	{ id: 'naogaon', en: 'Naogaon', bn: 'নওগাঁ', division: 'rajshahi' },
	{ id: 'natore', en: 'Natore', bn: 'নাটোর', division: 'rajshahi' },
	{ id: 'pabna', en: 'Pabna', bn: 'পাবনা', division: 'rajshahi' },
	{ id: 'rajshahi', en: 'Rajshahi', bn: 'রাজশাহী', division: 'rajshahi' },
	{ id: 'sirajganj', en: 'Sirajganj', bn: 'সিরাজগঞ্জ', division: 'rajshahi' },

	{ id: 'dinajpur', en: 'Dinajpur', bn: 'দিনাজপুর', division: 'rangpur' },
	{ id: 'gaibandha', en: 'Gaibandha', bn: 'গাইবান্ধা', division: 'rangpur' },
	{ id: 'kurigram', en: 'Kurigram', bn: 'কুড়িগ্রাম', division: 'rangpur' },
	{ id: 'lalmonirhat', en: 'Lalmonirhat', bn: 'লালমনিরহাট', division: 'rangpur' },
	{ id: 'nilphamari', en: 'Nilphamari', bn: 'নীলফামারী', division: 'rangpur' },
	{ id: 'panchagarh', en: 'Panchagarh', bn: 'পঞ্চগড়', division: 'rangpur' },
	{ id: 'rangpur', en: 'Rangpur', bn: 'রংপুর', division: 'rangpur' },
	{ id: 'thakurgaon', en: 'Thakurgaon', bn: 'ঠাকুরগাঁও', division: 'rangpur' },

	{ id: 'habiganj', en: 'Habiganj', bn: 'হবিগঞ্জ', division: 'sylhet' },
	{ id: 'moulvibazar', en: 'Moulvibazar', bn: 'মৌলভীবাজার', division: 'sylhet' },
	{ id: 'sunamganj', en: 'Sunamganj', bn: 'সুনামগঞ্জ', division: 'sylhet' },
	{ id: 'sylhet', en: 'Sylhet', bn: 'সিলেট', division: 'sylhet' }
];
