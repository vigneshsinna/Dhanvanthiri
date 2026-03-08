import { Helmet } from 'react-helmet-async';

const BRAND_LOGO_SRC = '/images/dhanvanthiri-logo.png';

export function AboutPage() {
    return (
        <>
            <Helmet>
                <title>About Us | Traditional Tamil Foods, Pickles & Podi | Dhanvanthiri Foods</title>
                <meta name="description" content="Dhanvanthiri Foods preserves the rich heritage of traditional Tamil foods. Discover our authentic homemade Tamil pickles, thokku, and podi." />
                <meta name="keywords" content="Traditional Tamil Foods, Tamil Pickles, Tamil Podi, Tamil Thokku, South Indian condiments" />
            </Helmet>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-brand-900 py-24 text-white sm:py-32">
                <div className="absolute inset-0 opacity-20">
                    <img src="/images/about/brand-story.png" alt="Traditional Tamil Kitchen Background" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-brand-900/60 mix-blend-multiply"></div>
                </div>
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <div className="mx-auto mb-8 h-28 w-28 overflow-hidden sm:h-32 sm:w-32">
                        <img src={BRAND_LOGO_SRC} alt="Dhanvanthiri Logo" className="h-full w-full origin-center scale-[1.95] object-contain drop-shadow-lg" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl drop-shadow-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Preserving the Heritage of<br />Traditional Tamil Foods
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-brand-50 drop-shadow-sm">
                        Authentic homemade recipes passed down through generations, bringing the essence of Tamil culinary tradition to every meal.
                    </p>
                </div>
            </section>

            {/* SEO Optimized About Section */}
            <section className="py-24 bg-orange-50/50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>About Dhanvanthiri Foods</h2>
                        <div className="mt-8 space-y-6 text-lg leading-relaxed text-slate-700 font-medium">
                            <p>
                                <strong>Dhanvanthiri Foods</strong> is dedicated to preserving and sharing the rich heritage of <span className="text-brand-700">Traditional Tamil Foods</span> through authentic homemade recipes. Our brand focuses on preparing classic South Indian condiments such as <span className="text-orange-600">Tamil Pickles</span> (Oorugai), <span className="text-brand-700">Tamil Thokku</span>, and <span className="text-orange-600">Tamil Podi</span> using time-honoured cooking techniques and carefully selected natural ingredients.
                            </p>
                            <p>
                                Inspired by traditional Tamil kitchens, our products include varieties like Mango Pickle, Lime Pickle, Citron Pickle, Curry Leaf Thokku, Garlic Thokku, Vallarai Podi, Murungai Keerai Podi, and Horse Gram Podi. Each product reflects the authentic flavors and nutritional richness of Tamil cuisine.
                            </p>
                            <p>
                                At Dhanvanthiri Foods, we believe that traditional recipes are not only about taste but also about wellness. Many of the ingredients used in our products such as curry leaves, moringa leaves, horse gram, garlic, sesame seeds, and traditional herbs have been valued in Tamil culture for their health benefits for generations.
                            </p>
                            <p>
                                Our mission is to bring the authentic taste of traditional Tamil home cooking to modern households while maintaining the purity, quality, and natural goodness of every ingredient. Whether it is the tangy taste of oorugai (pickle), the rich flavor of thokku, or the aromatic spice of podi, Dhanvanthiri Foods brings the essence of Tamil culinary tradition to every meal.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Story Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
                        <div className="lg:pr-8 lg:pt-4">
                            <div className="max-w-xl">
                                <p className="text-base font-semibold leading-7 text-brand-600 uppercase tracking-wider">Our Story</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    In many Tamil homes, the kitchen is where memories are created.
                                </h2>
                                <div className="mt-8 space-y-6 text-lg text-slate-600 leading-relaxed">
                                    <p>
                                        The aroma of freshly roasted spices, the sound of mustard seeds spluttering in hot oil, and jars of homemade pickles resting under the warm sunlight are all part of a tradition that has been passed down for generations.
                                    </p>
                                    <p>
                                        <strong className="text-slate-900">Dhanvanthiri Foods was born from this very tradition.</strong>
                                    </p>
                                    <p>
                                        We wanted to preserve the authentic flavors of Tamil kitchens — the recipes that our mothers and grandmothers lovingly prepared using simple ingredients and time-tested techniques.
                                    </p>
                                    <p>
                                        From tangy Mango Pickle and Lime Pickle to flavorful Garlic Thokku and Curry Leaf Thokku, and nourishing Vallarai Podi and Murungai Keerai Podi, every product we make reflects the richness of traditional Tamil cooking.
                                    </p>
                                    <p className="font-semibold text-brand-800 italic border-l-4 border-brand-500 pl-4 py-2 bg-brand-50 rounded-r-lg">
                                        Our goal is not just to create food, but to preserve a heritage.
                                    </p>
                                    <p>
                                        Every jar and every packet carries the warmth of home, the wisdom of traditional ingredients, and the authentic taste of Tamil culture. Through Dhanvanthiri Foods, we hope to bring the comforting flavors of traditional Tamil kitchens to families everywhere.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start justify-end lg:order-first">
                            <div className="relative isolate w-full max-w-xl">
                                <div className="absolute -inset-y-8 -inset-x-8 -z-10 rounded-3xl bg-amber-50" />
                                <img
                                    src="/images/about/brand-story.png"
                                    alt="Traditional South Indian Kitchen"
                                    className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-slate-900/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-24 bg-slate-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-orange-50 blur-3xl rounded-full opacity-70 -z-10 translate-y-10 translate-x-10"></div>
                            <img
                                src="/images/about/mission-vision.png"
                                alt="Premium traditional ingredients"
                                className="aspect-square w-full rounded-[2.5rem] object-cover shadow-xl ring-4 ring-white"
                            />
                        </div>

                        <div className="space-y-10">
                            <div className="bg-white p-10 rounded-3xl shadow-soft relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="absolute top-0 left-0 w-2 h-full bg-brand-500 transition-all duration-300 group-hover:w-3"></div>
                                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    <span className="text-3xl">🌿</span> Our Mission
                                </h3>
                                <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                                    To preserve and promote traditional Tamil foods by preparing authentic pickles, thokku, and podi using natural ingredients and traditional recipes, while delivering high-quality, flavorful products that bring the taste of home to every customer.
                                </p>
                            </div>

                            <div className="bg-white p-10 rounded-3xl shadow-soft relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="absolute top-0 left-0 w-2 h-full bg-orange-500 transition-all duration-300 group-hover:w-3"></div>
                                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    <span className="text-3xl">🌅</span> Our Vision
                                </h3>
                                <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                                    To become a trusted brand known for celebrating the richness of Tamil culinary heritage, bringing traditional South Indian flavors to households across India and around the world.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
