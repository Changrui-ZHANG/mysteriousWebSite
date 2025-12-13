import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface CVProps {
    isDarkMode: boolean;
}

export function CV({ isDarkMode }: CVProps) {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const skills = {
        frontend: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "Vite", "Three.js"],
        backend: ["Java", "Spring Boot", "Scala", "C/C++", "Python", "REST API"],
        database: ["PostgreSQL", "MariaDB", "MySQL", "SQL/NoSQL", "Elasticsearch", "Redis"],
        devops: ["Docker", "CI/CD", "Git", "Jenkins", "Linux", "Windows"],
        os: ["Linux", "Windows"] // Added as per request, though partially redundant with DevOps
    };

    // Helper to get array of descriptions safely
    const getArray = (key: string): string[] => {
        const items = t(key, { returnObjects: true });
        if (Array.isArray(items)) {
            return items as string[];
        }
        return [];
    };

    const experiences = [
        {
            title: t('cv.exp.espace.title'),
            role: t('cv.exp.espace.role'),
            period: "Current",
            location: "Paris, France",
            description: getArray('cv.exp.espace.desc'),
            tech: ["Java", "Spring Boot", "ReactJS", "Vite", "Tailwind", "Docker", "PostgreSQL"]
        },
        {
            title: t('cv.exp.rakuten.title'),
            role: t('cv.exp.rakuten.role'),
            period: "02/2024 - 09/2024",
            location: "Paris, France",
            description: getArray('cv.exp.rakuten.desc'),
            tech: ["Java", "Spring Boot", "ReactJS", "JavaScript", "TypeScript", "SQL", "Docker", "Git", "Jenkins", "Elasticsearch", "Hibernate", "Redis", "MariaDB", "Liquibase", "Jira", "Velocity", "Prometheus", "Grafana", "CI/CD", "IntelliJ", "API REST"]
        },
        {
            title: t('cv.exp.sorbonne.title'),
            role: t('cv.exp.sorbonne.role'),
            period: "09/2023 - 03/2024",
            location: "Paris, France",
            description: getArray('cv.exp.sorbonne.desc'),
            tech: ["Java", "Spring Boot", "ReactJS", "MySQL", "Feature Flags", "Microservices"]
        },
        {
            title: t('cv.exp.quichefs.title'),
            role: t('cv.exp.quichefs.role'),
            period: "09/2023 - 03/2024",
            location: "Paris, France",
            description: getArray('cv.exp.quichefs.desc'),
            tech: ["C", "Linux Kernel", "File Systems", "ioctl"]
        },
        {
            title: t('cv.exp.database.title'),
            role: t('cv.exp.database.role'),
            period: "09/2021 - 03/2022",
            location: "Paris, France",
            description: getArray('cv.exp.database.desc'),
            tech: ["PostgreSQL", "BOUML", "StarUML"]
        }
    ];

    const education = [
        {
            degree: t('cv.edu.master'),
            school: "Sorbonne Université",
            period: "2022 - 2024"
        },
        {
            degree: t('cv.edu.licence'),
            school: "Université Paris Cité",
            period: "2019 - 2022"
        }
    ];

    return (
        <div className={`min-h-screen pt-32 pb-24 px-4 sm:px-8 transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-dark text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* Header */}
            <header className="max-w-4xl mx-auto text-center mb-24">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl sm:text-8xl font-heading font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent leading-tight pb-2"
                >
                    Changrui ZHANG
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-serif italic opacity-70 mb-8"
                >
                    {t('cv.role')}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-6 text-sm opacity-60 font-mono"
                >
                    <span>m.zhang.changrui@gmail.com</span>
                    <span>+33 6 52 94 63 09</span>
                    <span>Paris, France</span>
                    <a href="https://linkedin.com/in/changrui-zhang" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
                    <a href="https://github.com/Changrui-ZHANG" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">GitHub</a>
                </motion.div>
            </header>

            {/* Profile */}
            <section className="max-w-3xl mx-auto mb-24 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-xl rounded-full opacity-50"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className={`relative p-8 rounded-2xl border backdrop-blur-md ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5 shadow-lg'}`}
                >
                    <h2 className="text-3xl font-heading font-bold mb-6">{t('cv.sections.profile')}</h2>
                    <p className="text-lg leading-relaxed opacity-80">
                        {t('cv.profile_text')}
                    </p>
                </motion.div>
            </section>

            {/* Experience Timeline */}
            <section className="max-w-5xl mx-auto mb-24">
                <h2 className="text-5xl font-heading font-bold text-center mb-16">{t('cv.sections.experience')}</h2>
                <div className="relative">
                    {/* Vertical Line */}
                    <div className={`absolute left-0 sm:left-1/2 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`}></div>

                    {experiences.map((exp, index) => (
                        <div key={index} className={`relative flex flex-col sm:flex-row items-center mb-16 ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                            {/* Dot */}
                            <div className={`absolute left-[-5px] sm:left-1/2 w-3 h-3 rounded-full -translate-x-1.5 z-10 ${isDarkMode ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-purple-500'}`}></div>

                            {/* Content */}
                            <div className="w-full sm:w-1/2 pl-8 sm:px-12">
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className={`p-6 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-md hover:shadow-xl'} transition-all`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent">{exp.title}</h3>
                                        <span className="text-xs font-mono opacity-50 whitespace-nowrap">{exp.period}</span>
                                    </div>
                                    <p className="text-lg font-serif italic mb-4 opacity-90">{exp.role}</p>
                                    <ul className="space-y-2 mb-6 opacity-70 text-sm list-disc pl-4">
                                        {exp.description.map((desc, i) => (
                                            <li key={i}>{desc}</li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-wrap gap-2">
                                        {exp.tech.map((t, i) => (
                                            <span key={i} className={`px-2 py-1 text-xs rounded-md ${isDarkMode ? 'bg-white/10 text-cyan-200' : 'bg-gray-100 text-purple-700'}`}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section className="max-w-6xl mx-auto mb-24">
                <h2 className="text-5xl font-heading font-bold text-center mb-16">{t('cv.sections.skills')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.entries(skills).map(([category, items], idx) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-gray-100'}`}
                        >
                            <h3 className="text-xl font-bold mb-6 capitalize text-center">{category}</h3>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {items.map((skill, i) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${isDarkMode ? 'bg-gradient-to-r from-white/10 to-white/5 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="max-w-4xl mx-auto mb-24">
                <h2 className="text-4xl font-heading font-bold text-center mb-12 opacity-80">{t('cv.sections.education')}</h2>
                <div className="grid gap-6">
                    {education.map((edu, index) => (
                        <div key={index} className={`flex flex-col sm:flex-row justify-between items-center p-8 rounded-xl border ${isDarkMode ? 'border-white/10' : 'border-gray-200 bg-white'}`}>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold">{edu.degree}</h3>
                                <p className="opacity-60 mt-1">{edu.school}</p>
                            </div>
                            <span className="mt-4 sm:mt-0 px-4 py-2 rounded-full border border-current opacity-50 font-mono text-sm">
                                {edu.period}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Additional Info Grid: Soft Skills, Languages, Interests */}
            <section className="max-w-6xl mx-auto mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Soft Skills */}
                    <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-gray-100'}`}>
                        <h3 className="text-2xl font-heading font-bold mb-6 text-center">{t('cv.sections.soft_skills')}</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {getArray('cv.soft_skills_list').map((item, i) => (
                                <span key={i} className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-800'}`}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-gray-100'}`}>
                        <h3 className="text-2xl font-heading font-bold mb-6 text-center">{t('cv.sections.languages')}</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center border-b pb-2 border-inherit opacity-80">
                                <span>{t('cv.languages_list.zh')}</span>
                            </li>
                            <li className="flex justify-between items-center border-b pb-2 border-inherit opacity-80">
                                <span>{t('cv.languages_list.en')}</span>
                            </li>
                            <li className="flex justify-between items-center border-b pb-2 border-inherit opacity-80">
                                <span>{t('cv.languages_list.fr')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Interests */}
                    <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-gray-100'}`}>
                        <h3 className="text-2xl font-heading font-bold mb-6 text-center">{t('cv.sections.interests')}</h3>
                        <div className="flex flex-col items-center gap-4">
                            {getArray('cv.interests_list').map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
                                    <span className="text-lg opacity-80">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
}

export default CV;
