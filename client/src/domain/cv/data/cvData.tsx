import { DiRedis } from "react-icons/di";
import { FaReact, FaJava, FaPython, FaDocker, FaLinux, FaGitAlt, FaJenkins, FaWindows, FaServer, FaDatabase } from "react-icons/fa";
import { SiTypescript, SiTailwindcss, SiVite, SiThreedotjs, SiSpringboot, SiScala, SiCplusplus, SiPostgresql, SiMariadb, SiMysql, SiElasticsearch } from "react-icons/si";
import { IoLogoJavascript } from "react-icons/io5";
import { TbApi } from "react-icons/tb";
import { TFunction } from 'i18next';

type TranslationFunction = TFunction<'translation', undefined>;

export const getCVData = (t: TranslationFunction) => {

    const getArray = (key: string): string[] => {
        const items = t(key, { returnObjects: true });
        if (Array.isArray(items)) {
            return items as string[];
        }
        return [];
    };

    const skills = {
        frontend: [
            { name: "React", icon: <FaReact /> },
            { name: "JavaScript", icon: <IoLogoJavascript /> },
            { name: "TypeScript", icon: <SiTypescript /> },
            { name: "Tailwind CSS", icon: <SiTailwindcss /> },
       
         
        ],
        backend: [
            { name: "Java", icon: <FaJava /> },
            { name: "Spring Boot", icon: <SiSpringboot /> },
            { name: "Scala", icon: <SiScala /> },
            { name: "C/C++", icon: <SiCplusplus /> },
            { name: "Python", icon: <FaPython /> },

        ],
        database: [
            { name: "PostgreSQL", icon: <SiPostgresql /> },
            { name: "MariaDB", icon: <SiMariadb /> },
            { name: "MySQL", icon: <SiMysql /> },
  
        ],
        devops: [
            { name: "Docker", icon: <FaDocker /> },
            { name: "CI/CD", icon: <FaServer /> },
            { name: "Git", icon: <FaGitAlt /> },
            { name: "Jenkins", icon: <FaJenkins /> },

        ]
    };

    const experiences = [
        {
            title: t('cv.exp.espace.title'),
            role: t('cv.exp.espace.role'),
            period: "2024 - Present",
            description: getArray('cv.exp.espace.desc'),
            tech: getArray('cv.exp.espace.tech')
        },
        {
            title: t('cv.exp.rakuten.title'),
            role: t('cv.exp.rakuten.role'),
            period: "02/2024 - 09/2024",
            description: getArray('cv.exp.rakuten.desc'),
            tech: getArray('cv.exp.rakuten.tech')
        },
        {
            title: t('cv.exp.sorbonne.title'),
            role: t('cv.exp.sorbonne.role'),
            period: "09/2023 - 03/2024",
            description: getArray('cv.exp.sorbonne.desc'),
            tech: getArray('cv.exp.sorbonne.tech')
        },
        {
            title: t('cv.exp.ouichefs.title'),
            role: t('cv.exp.ouichefs.role'),
            period: "09/2023 - 03/2024",
            description: getArray('cv.exp.ouichefs.desc'),
            tech: getArray('cv.exp.ouichefs.tech')
        }
    ];

    const education = [
        {
            degree: t('cv.edu.esgi'),
            school: "ESGI",
            period: "2024 - 2026",
            icon: <img src="/logos/esgi.png" alt="ESGI" className="w-full h-full object-contain" />,
            level: t('cv.masters_degree')
        },
        {
            degree: t('cv.edu.master'),
            school: "Sorbonne Université",
            period: "2022 - 2024",
            icon: <img src="/logos/sorbonne.png" alt="Sorbonne" className="w-full h-full object-contain" />,
            level: t('cv.masters_degree')
        },
        {
            degree: t('cv.edu.licence'),
            school: "Université Paris Cité",
            period: "2019 - 2022",
            icon: <img src="/logos/paris-cite.png" alt="Paris Cité" className="w-full h-full object-contain" />,
            level: t('cv.bachelors_degree')
        }
    ];

    return { skills, experiences, education };
};
