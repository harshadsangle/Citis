import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const PROGRAMME_CODE = "COMPTIA-CERTIFICATIONS";
const PROGRAMME_NAME = "CompTIA Certifications";
const PUBLISHED = "PUBLISHED";

const COURSE_DEFINITIONS = [
  {
    code: "COMPTIA-A-220-1102",
    title: "CompTIA A+ Core 2 (220-1102)",
    sourcePath: "attached_assets/CompTIA_A+_220-1102_Exam_Objectives_1788280752624.pdf",
    resourceTitle: "Source PDF — CompTIA A+ Core 2 (220-1102) Exam Objectives",
    storageFilename: "comptia-a-plus-core-2-220-1102-exam-objectives.pdf",
    description: "Official CompTIA A+ Core 2 exam objectives for operating systems, security, software troubleshooting, and operational procedures.",
    modules: [
      {
        title: "1.0 Operating Systems",
        lessons: [
          "1.1 Identify basic features of Microsoft Windows editions.",
          "1.2 Given a scenario, use the appropriate Microsoft command-line tool.",
          "1.3 Given a scenario, use the appropriate Microsoft operating system management tools.",
          "1.4 Given a scenario, use the appropriate Microsoft operating system utilities.",
          "1.5 Given a scenario, use the appropriate Windows settings.",
          "1.6 Given a scenario, configure Microsoft Windows networking features on a client/desktop.",
          "1.7 Given a scenario, apply application installation and configuration concepts.",
          "1.8 Explain common OS types and their purposes.",
          "1.9 Given a scenario, perform OS installations and upgrades in a diverse OS environment.",
          "1.10 Identify common features and tools of the macOS/desktop OS.",
          "1.11 Identify common features and tools of the Linux client/desktop OS.",
        ],
      },
      {
        title: "2.0 Security",
        lessons: [
          "2.1 Summarize various security measures and their purposes.",
          "2.2 Compare and contrast wireless security protocols and authentication methods.",
          "2.3 Given a scenario, detect, remove, and prevent malware using the appropriate tools and methods.",
          "2.4 Given a scenario, configure a workstation to meet best practices for security.",
          "2.5 Given a scenario, use common data destruction and disposal methods.",
          "2.6 Given a scenario, configure appropriate security settings on small office/home office (SOHO) wireless and wired networks.",
          "2.7 Given a scenario, install and configure browsers and relevant security settings.",
          "2.8 Given a scenario, troubleshoot common Windows OS problems.",
          "2.9 Given a scenario, troubleshoot common personal computer (PC) security issues.",
          "2.10 Given a scenario, use best practice procedures for malware removal.",
        ],
      },
      {
        title: "3.0 Software Troubleshooting",
        lessons: [
          "3.1 Given a scenario, troubleshoot common mobile OS and application issues.",
          "3.2 Given a scenario, troubleshoot common mobile OS and application security issues.",
          "3.3 Given a scenario, implement best practices associated with documentation and support systems information management.",
          "3.4 Explain basic change-management best practices.",
          "3.5 Given a scenario, implement workstation backup and recovery methods.",
        ],
      },
      {
        title: "4.0 Operational Procedures",
        lessons: [
          "4.1 Given a scenario, use common safety procedures.",
          "4.2 Summarize environmental impacts and local environmental controls.",
          "4.3 Explain the importance of prohibited content/activity and privacy, licensing, and policy concepts.",
          "4.4 Given a scenario, use proper communication techniques and professionalism.",
          "4.5 Explain the basics of scripting.",
          "4.6 Given a scenario, use remote access technologies.",
          "4.7 Given a scenario, use appropriate troubleshooting methodology.",
          "4.8 Given a scenario, use appropriate backup and recovery procedures.",
          "4.9 Given a scenario, use appropriate documentation and change-management procedures.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-CASP-CAS-004",
    title: "CompTIA Advanced Security Practitioner (CASP+) (CAS-004)",
    sourcePath: "attached_assets/CompTIA_CASP+_cas-004_Exam_Objectives_1788280752625.pdf",
    resourceTitle: "Source PDF — CompTIA Advanced Security Practitioner (CASP+) CAS-004 Exam Objectives",
    storageFilename: "comptia-casp-plus-cas-004-exam-objectives.pdf",
    description: "Official CompTIA CASP+ exam objectives for enterprise security architecture, operations, engineering, cryptography, governance, risk, and compliance.",
    modules: [
      {
        title: "1.0 Security Architecture",
        lessons: [
          "1.1 Given a scenario, analyze the security requirements and objectives to ensure an appropriate, secure network architecture.",
          "1.2 Given a scenario, analyze the organizational requirements to determine the proper infrastructure security design.",
          "1.3 Given a scenario, integrate software applications securely into an enterprise architecture.",
          "1.4 Given a scenario, implement data security techniques for securing enterprise architecture.",
          "1.5 Given a scenario, analyze the security requirements and objectives to provide the appropriate authentication and authorization controls.",
          "1.6 Explain how cryptography and public key infrastructure (PKI) support security objectives and requirements.",
          "1.7 Explain the impact of emerging technologies on enterprise security and privacy.",
          "1.8 Given a scenario, implement secure solutions for the enterprise.",
        ],
      },
      {
        title: "2.0 Security Operations",
        lessons: [
          "2.1 Given a scenario, perform threat management activities.",
          "2.2 Given a scenario, analyze indicators of compromise and formulate an appropriate response.",
          "2.3 Given a scenario, perform vulnerability management activities.",
          "2.4 Given a scenario, use the appropriate vulnerability assessment and penetration testing methods and tools.",
          "2.5 Given a scenario, analyze vulnerabilities and recommend risk mitigations.",
          "2.6 Given a scenario, use processes to reduce risk.",
          "2.7 Explain the importance of forensic concepts.",
          "2.8 Given a scenario, use forensic analysis tools.",
          "2.9 Given a scenario, perform incident response activities.",
        ],
      },
      {
        title: "3.0 Security Engineering and Cryptography",
        lessons: [
          "3.1 Given a scenario, apply secure configurations to enterprise mobility.",
          "3.2 Given a scenario, configure and implement endpoint security controls.",
          "3.3 Explain security considerations impacting specific sectors and operational technologies.",
          "3.4 Explain how cloud technology adoption impacts organizational security.",
          "3.5 Given a scenario, troubleshoot issues with cryptographic implementations.",
          "3.6 Given a scenario, apply secure solutions to industrial control systems.",
          "3.7 Given a scenario, implement secure communications and collaboration solutions.",
        ],
      },
      {
        title: "4.0 Governance, Risk, and Compliance",
        lessons: [
          "4.1 Explain the importance of managing and mitigating vendor risk.",
          "4.2 Explain compliance frameworks and legal considerations, and their organizational impact.",
          "4.3 Explain the importance of business continuity and disaster recovery concepts.",
          "4.4 Given a scenario, apply the appropriate risk strategies.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-CLOUD-CV0-004",
    title: "CompTIA Cloud+ (CV0-004)",
    sourcePath: "attached_assets/CompTIA_Cloud+_cv0-004_Exam_Objectives_1788280752626.pdf",
    resourceTitle: "Source PDF — CompTIA Cloud+ CV0-004 Exam Objectives",
    storageFilename: "comptia-cloud-plus-cv0-004-exam-objectives.pdf",
    description: "Official CompTIA Cloud+ exam objectives for cloud architecture, deployment, operations, security, DevOps, and troubleshooting.",
    modules: [
      {
        title: "1.0 Cloud Architecture",
        lessons: [
          "1.1 Given a scenario, use the appropriate cloud service model.",
          "1.2 Explain concepts related to service availability.",
          "1.3 Explain cloud networking concepts.",
          "1.4 Compare and contrast storage resources and technologies.",
          "1.5 Explain the purpose of cloud-native design concepts.",
          "1.6 Compare and contrast containerization concepts.",
          "1.7 Compare and contrast virtualization concepts.",
          "1.8 Summarize cost considerations related to cloud usage.",
          "1.9 Explain the importance of database concepts.",
          "1.10 Compare and contrast methods for optimizing workloads using cloud resources.",
          "1.11 Identify evolving technologies in the cloud.",
        ],
      },
      {
        title: "2.0 Deployment",
        lessons: [
          "2.1 Compare and contrast cloud deployment models.",
          "2.2 Given a scenario, implement appropriate deployment strategies.",
          "2.3 Summarize aspects of cloud migration.",
          "2.4 Given a scenario, use code to deploy and configure cloud resources.",
          "2.5 Given a set of requirements, provision the appropriate cloud resources.",
        ],
      },
      {
        title: "3.0 Operations",
        lessons: [
          "3.1 Given a scenario, configure appropriate resources to achieve observability.",
          "3.2 Explain the importance of cloud operations management.",
          "3.3 Given a scenario, use appropriate backup and recovery methods.",
          "3.4 Given a scenario, manage the life cycle of cloud resources.",
        ],
      },
      {
        title: "4.0 Security",
        lessons: [
          "4.1 Explain vulnerability management concepts.",
          "4.2 Compare and contrast aspects of compliance and regulation.",
          "4.3 Given a scenario, implement identity and access management.",
          "4.4 Given a scenario, apply security best practices.",
          "4.5 Given a scenario, apply security controls in the cloud.",
          "4.6 Given a scenario, monitor suspicious activities to identify common attacks.",
        ],
      },
      {
        title: "5.0 DevOps Fundamentals",
        lessons: [
          "5.1 Explain source control concepts.",
          "5.2 Explain concepts related to continuous integration/continuous deployment (CI/CD) pipelines.",
          "5.3 Explain concepts related to integration of systems.",
          "5.4 Explain the importance of tools used in DevOps environments.",
        ],
      },
      {
        title: "6.0 Troubleshooting",
        lessons: [
          "6.1 Given a scenario, troubleshoot deployment issues.",
          "6.2 Given a scenario, troubleshoot network issues.",
          "6.3 Given a scenario, troubleshoot security issues.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-CLOUD-ESSENTIALS-CLO-002",
    title: "CompTIA Cloud Essentials+ (CLO-002)",
    sourcePath: "attached_assets/CompTIA_Cloud_Essentials+_cl0-002_Exam_Objectives_1788280752626.pdf",
    resourceTitle: "Source PDF — CompTIA Cloud Essentials+ CLO-002 Exam Objectives",
    storageFilename: "comptia-cloud-essentials-plus-clo-002-exam-objectives.pdf",
    description: "Official CompTIA Cloud Essentials+ exam objectives for cloud concepts, business principles, management, operations, governance, risk, compliance, and security.",
    modules: [
      {
        title: "1.0 Cloud Concepts",
        lessons: [
          "1.1 Explain cloud principles.",
          "1.2 Identify cloud networking concepts.",
          "1.3 Identify cloud storage technologies.",
          "1.4 Summarize important aspects of cloud design.",
        ],
      },
      {
        title: "2.0 Business Principles of Cloud Environments",
        lessons: [
          "2.1 Given a scenario, use appropriate cloud assessments.",
          "2.2 Summarize the financial aspects of engaging a cloud provider.",
          "2.3 Identify the important business aspects of vendor relations in cloud adoptions.",
          "2.4 Identify the benefits or solutions of utilizing cloud services.",
          "2.5 Compare and contrast cloud migration approaches.",
        ],
      },
      {
        title: "3.0 Management and Technical Operations",
        lessons: [
          "3.1 Explain aspects of operating within the cloud.",
          "3.2 Explain DevOps in cloud environments.",
          "3.3 Given a scenario, review and report on the financial expenditures related to cloud resources.",
        ],
      },
      {
        title: "4.0 Governance, Risk, Compliance, and Security for the Cloud",
        lessons: [
          "4.1 Explain policies or procedures.",
          "4.2 Identify the importance and impacts of compliance in the cloud.",
          "4.3 Explain security concerns, measures, or concepts of cloud operations.",
          "4.4 Given a scenario, implement risk management and compliance controls.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-DATASYS-DS0-001",
    title: "CompTIA DataSys+ (DS0-001)",
    sourcePath: "attached_assets/CompTIA_DataSys+_ds0-001_Exam_Objectives_1788280752627.pdf",
    resourceTitle: "Source PDF — CompTIA DataSys+ DS0-001 Exam Objectives",
    storageFilename: "comptia-datasys-plus-ds0-001-exam-objectives.pdf",
    description: "Official CompTIA DataSys+ exam objectives for database fundamentals, deployment, management, maintenance, security, and business continuity.",
    modules: [
      {
        title: "1.0 Database Fundamentals",
        lessons: [
          "1.1 Compare and contrast database structure types.",
          "1.2 Given a scenario, develop, modify, and run SQL code.",
          "1.3 Compare and contrast scripting methods and scripting environments.",
          "1.4 Explain the impact of programming on database operations.",
        ],
      },
      {
        title: "2.0 Database Deployment",
        lessons: [
          "2.1 Compare and contrast aspects of database planning and design.",
          "2.2 Explain database implementation, testing, and deployment phases.",
          "2.3 Explain the purpose of monitoring and reporting for database management and performance.",
        ],
      },
      {
        title: "3.0 Database Management and Maintenance",
        lessons: [
          "3.1 Explain common database maintenance processes.",
          "3.2 Given a scenario, produce documentation and use relevant tools.",
          "3.3 Explain database performance-tuning concepts.",
          "3.4 Given a scenario, perform database management activities.",
          "3.5 Given a scenario, troubleshoot database issues.",
        ],
      },
      {
        title: "4.0 Data and Database Security",
        lessons: [
          "4.1 Explain data security concepts.",
          "4.2 Explain the purpose of governance and regulatory compliance.",
          "4.3 Given a scenario, implement policies and best practices related to authentication and authorization.",
          "4.4 Explain the purpose of database infrastructure security.",
          "4.5 Describe types of attacks and their effects on data systems.",
        ],
      },
      {
        title: "5.0 Business Continuity",
        lessons: [
          "5.1 Explain the importance of disaster recovery and relevant techniques.",
          "5.2 Explain backup and restore best practices and processes.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-DATAX-DY0-001",
    title: "CompTIA DataX (DY0-001)",
    sourcePath: "attached_assets/CompTIA_DataX_dy0-001_Exam_Objectives_1788280752628.pdf",
    resourceTitle: "Source PDF — CompTIA DataX DY0-001 Exam Objectives",
    storageFilename: "comptia-datax-dy0-001-exam-objectives.pdf",
    description: "Official CompTIA DataX exam objectives for mathematics, statistics, modeling, analysis, machine learning, operations, and specialized data science applications.",
    modules: [
      {
        title: "1.0 Mathematics and Statistics",
        lessons: [
          "1.1 Given a scenario, apply the appropriate statistical method or concept.",
          "1.2 Explain probability and synthetic modeling concepts and their uses.",
          "1.3 Explain the concepts and applications of calculus.",
          "1.4 Explain linear algebra concepts and their applications.",
        ],
      },
      {
        title: "2.0 Modeling, Analysis, and Outcomes",
        lessons: [
          "2.1 Compare and contrast various types of temporal models.",
          "2.2 Explain the concepts and applications of causal modeling.",
          "2.3 Given a scenario, use the appropriate exploratory data analysis (EDA) method or process.",
          "2.4 Given a scenario, analyze common issues with data.",
          "2.5 Given a scenario, conduct a model design iteration process.",
          "2.6 Given a scenario, analyze results of experiments and testing to justify final model recommendations and selection.",
        ],
      },
      {
        title: "3.0 Machine Learning",
        lessons: [
          "3.1 Given a scenario, apply foundational machine-learning concepts.",
          "3.2 Given a scenario, apply appropriate statistical supervised machine-learning concepts.",
          "3.3 Given a scenario, apply appropriate instance-based supervised machine-learning concepts.",
          "3.4 Given a scenario, apply tree-based supervised machine-learning concepts.",
          "3.5 Explain concepts related to deep learning.",
        ],
      },
      {
        title: "4.0 Operations and Processes",
        lessons: [
          "4.1 Explain concepts related to unsupervised machine learning.",
          "4.2 Given a scenario, translate results and communicate via appropriate methods and mediums.",
        ],
      },
      {
        title: "5.0 Specialized Applications of Data Science",
        lessons: [
          "5.1 Explain the role of data science in various business functions.",
          "5.2 Explain the process of and purpose for obtaining different types of data.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-ITF-FC0-U61",
    title: "CompTIA IT Fundamentals (ITF+) (FC0-U61)",
    sourcePath: "attached_assets/CompTIA_ITF+_fc0-u61_Exam_Objectives_1788280752628.pdf",
    resourceTitle: "Source PDF — CompTIA IT Fundamentals (ITF+) FC0-U61 Exam Objectives",
    storageFilename: "comptia-it-fundamentals-itf-plus-fc0-u61-exam-objectives.pdf",
    description: "Official CompTIA IT Fundamentals+ exam objectives for IT concepts, infrastructure, applications, software development, databases, and security.",
    modules: [
      {
        title: "1.0 IT Concepts and Terminology",
        lessons: [
          "1.1 Compare and contrast notational systems.",
          "1.2 Compare and contrast fundamental data types and their characteristics.",
          "1.3 Illustrate the basics of computing and processing.",
          "1.4 Explain the value of data and information.",
          "1.5 Compare and contrast common units of measure.",
          "1.6 Explain the troubleshooting methodology.",
        ],
      },
      {
        title: "2.0 Infrastructure",
        lessons: [
          "2.1 Classify common types of input/output device interfaces.",
          "2.2 Given a scenario, set up and install common peripheral devices to a laptop/PC.",
          "2.3 Explain the purpose of common internal computing components.",
          "2.4 Compare and contrast common Internet service types.",
          "2.5 Compare and contrast storage types.",
          "2.6 Compare and contrast common computing devices and their purposes.",
          "2.7 Explain basic networking concepts.",
          "2.8 Given a scenario, install, configure and secure a basic wireless network.",
        ],
      },
      {
        title: "3.0 Applications and Software",
        lessons: [
          "3.1 Explain the purpose of operating systems.",
          "3.2 Compare and contrast components of an operating system.",
          "3.3 Explain the purpose and proper use of software.",
          "3.4 Explain methods of application architecture and delivery models.",
          "3.5 Given a scenario, configure and use web browsers.",
          "3.6 Compare and contrast general application concepts and uses.",
        ],
      },
      {
        title: "4.0 Software Development",
        lessons: [
          "4.1 Compare and contrast programming language categories.",
          "4.2 Given a scenario, use programming organizational techniques and interpret logic.",
          "4.3 Explain the purpose and use of programming concepts.",
        ],
      },
      {
        title: "5.0 Database Fundamentals",
        lessons: [
          "5.1 Explain database concepts and the purpose of a database.",
          "5.2 Compare and contrast various database structures.",
          "5.3 Summarize methods used to interface with databases.",
        ],
      },
      {
        title: "6.0 Security",
        lessons: [
          "6.1 Summarize confidentiality, integrity and availability concerns.",
          "6.2 Explain methods to secure devices and best practices.",
          "6.3 Summarize behavioral security concepts.",
          "6.4 Compare and contrast authentication, authorization, accounting and non-repudiation concepts.",
          "6.5 Explain password best practices.",
          "6.6 Explain common uses of encryption.",
          "6.7 Explain business continuity concepts.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-LINUX-XK0-005",
    title: "CompTIA Linux+ (XK0-005)",
    sourcePath: "attached_assets/CompTIA_Linux+_xk0-005_Exam_Objectives_1788280752629.pdf",
    resourceTitle: "Source PDF — CompTIA Linux+ XK0-005 Exam Objectives",
    storageFilename: "comptia-linux-plus-xk0-005-exam-objectives.pdf",
    description: "Official CompTIA Linux+ exam objectives for system management, security, scripting, containers, automation, and troubleshooting.",
    modules: [
      {
        title: "1.0 System Management",
        lessons: [
          "1.1 Summarize Linux fundamentals.",
          "1.2 Given a scenario, manage files and directories.",
          "1.3 Given a scenario, configure and manage storage using the appropriate tools.",
          "1.4 Given a scenario, configure and use the appropriate processes and services.",
          "1.5 Given a scenario, use the appropriate networking tools or configuration files.",
          "1.6 Given a scenario, build and install software.",
          "1.7 Given a scenario, manage software configurations.",
        ],
      },
      {
        title: "2.0 Security",
        lessons: [
          "2.1 Summarize the purpose and use of security best practices in a Linux environment.",
          "2.2 Given a scenario, implement identity management.",
          "2.3 Given a scenario, implement and configure firewalls.",
          "2.4 Given a scenario, configure and execute remote connectivity for system management.",
          "2.5 Given a scenario, apply the appropriate access controls.",
        ],
      },
      {
        title: "3.0 Scripting, Containers, and Automation",
        lessons: [
          "3.1 Given a scenario, create simple shell scripts to automate common tasks.",
          "3.2 Given a scenario, perform basic container operations.",
          "3.3 Given a scenario, perform basic version control using Git.",
          "3.4 Summarize common infrastructure as code technologies.",
          "3.5 Summarize container, cloud, and orchestration concepts.",
        ],
      },
      {
        title: "4.0 Troubleshooting",
        lessons: [
          "4.1 Given a scenario, analyze and troubleshoot storage issues.",
          "4.2 Given a scenario, analyze and troubleshoot network resource issues.",
          "4.3 Given a scenario, analyze and troubleshoot central processing unit (CPU) and memory issues.",
          "4.4 Given a scenario, analyze and troubleshoot user access and file permissions.",
          "4.5 Given a scenario, use systemd to diagnose and resolve common problems with a Linux system.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-NETWORK-N10-009",
    title: "CompTIA Network+ (N10-009)",
    sourcePath: "attached_assets/CompTIA_Network+_n10-009_Exam_Objectives_1788280752629.pdf",
    resourceTitle: "Source PDF — CompTIA Network+ N10-009 Exam Objectives",
    storageFilename: "comptia-network-plus-n10-009-exam-objectives.pdf",
    description: "Official CompTIA Network+ exam objectives for networking concepts, implementation, operations, security, and troubleshooting.",
    modules: [
      {
        title: "1.0 Networking Concepts",
        lessons: [
          "1.1 Explain concepts related to the Open Systems Interconnection (OSI) reference model.",
          "1.2 Compare and contrast networking appliances, applications, and functions.",
          "1.3 Summarize cloud concepts and connectivity options.",
          "1.4 Explain common networking protocols, ports, and traffic types.",
          "1.5 Compare and contrast transmission media and transceivers.",
          "1.6 Compare and contrast network topologies, architectures, and types.",
          "1.7 Given a scenario, use appropriate IPv4 network addressing.",
        ],
      },
      {
        title: "2.0 Network Implementation",
        lessons: [
          "2.1 Explain characteristics of routing technologies.",
          "2.2 Given a scenario, configure switching technologies and features.",
          "2.3 Given a scenario, configure wireless technologies and features.",
          "2.4 Given a scenario, configure virtualization technologies and features.",
          "2.5 Given a scenario, configure WAN technologies and features.",
        ],
      },
      {
        title: "3.0 Network Operations",
        lessons: [
          "3.1 Explain the purpose of organizational processes and procedures.",
          "3.2 Given a scenario, use network monitoring technologies.",
          "3.3 Explain disaster recovery (DR) concepts.",
          "3.4 Given a scenario, implement IPv4 and IPv6 network services.",
          "3.5 Compare and contrast network access and management methods.",
        ],
      },
      {
        title: "4.0 Network Security",
        lessons: [
          "4.1 Explain the importance of basic network security concepts.",
          "4.2 Summarize various types of attacks and their impact to the network.",
        ],
      },
      {
        title: "5.0 Network Troubleshooting",
        lessons: [
          "5.1 Explain the troubleshooting methodology.",
          "5.2 Given a scenario, troubleshoot common cabling and physical interface issues.",
          "5.3 Given a scenario, troubleshoot common issues with network services.",
          "5.4 Given a scenario, troubleshoot common performance issues.",
          "5.5 Given a scenario, use the appropriate tool or protocol to solve networking issues.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-PENTEST-PT0-002",
    title: "CompTIA PenTest+ (PT0-002)",
    sourcePath: "attached_assets/CompTIA_PenTest+_pt0-002_Exam_Objectives_1788280752630.pdf",
    resourceTitle: "Source PDF — CompTIA PenTest+ PT0-002 Exam Objectives",
    storageFilename: "comptia-pentest-plus-pt0-002-exam-objectives.pdf",
    description: "Official CompTIA PenTest+ exam objectives for planning, reconnaissance, vulnerability scanning, attacks, exploits, reporting, tools, and code analysis.",
    modules: [
      {
        title: "1.0 Planning and Scoping",
        lessons: [
          "1.1 Compare and contrast governance, risk, and compliance concepts.",
          "1.2 Explain the importance of scoping and organizational/customer requirements.",
          "1.3 Given a scenario, demonstrate an ethical hacking mindset by maintaining professionalism and integrity.",
        ],
      },
      {
        title: "2.0 Information Gathering and Vulnerability Scanning",
        lessons: [
          "2.1 Given a scenario, perform passive reconnaissance.",
          "2.2 Given a scenario, perform active reconnaissance.",
          "2.3 Given a scenario, analyze the results of a reconnaissance exercise.",
          "2.4 Given a scenario, perform vulnerability scanning.",
        ],
      },
      {
        title: "3.0 Attacks and Exploits",
        lessons: [
          "3.1 Given a scenario, research attack vectors and perform network attacks.",
          "3.2 Given a scenario, research attack vectors and perform wireless attacks.",
          "3.3 Given a scenario, research attack vectors and perform application-based attacks.",
          "3.4 Given a scenario, research attack vectors and perform attacks on cloud technologies.",
          "3.5 Explain common attacks and vulnerabilities against specialized systems.",
          "3.6 Given a scenario, perform a social engineering or physical attack.",
          "3.7 Given a scenario, perform post-exploitation techniques.",
        ],
      },
      {
        title: "4.0 Reporting and Communication",
        lessons: [
          "4.1 Compare and contrast important components of written reports.",
          "4.2 Given a scenario, analyze the findings and recommend the appropriate remediation within a report.",
          "4.3 Explain the importance of communication during the penetration testing process.",
          "4.4 Explain post-report delivery activities.",
        ],
      },
      {
        title: "5.0 Tools and Code Analysis",
        lessons: [
          "5.1 Explain the basic concepts of scripting and software development.",
          "5.2 Given a scenario, analyze a script or code sample for use in a penetration test.",
          "5.3 Explain use cases of the following tools during the phases of a penetration test.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-PROJECT-PK0-005",
    title: "CompTIA Project+ (PK0-005)",
    sourcePath: "attached_assets/CompTIA_Project+_pk0-005_Exam_Objectives_1788280752630.pdf",
    resourceTitle: "Source PDF — CompTIA Project+ PK0-005 Exam Objectives",
    storageFilename: "comptia-project-plus-pk0-005-exam-objectives.pdf",
    description: "Official CompTIA Project+ exam objectives for project management concepts, life cycle phases, tools, documentation, IT, and governance.",
    modules: [
      {
        title: "1.0 Project Management Concepts",
        lessons: [
          "1.1 Explain the basic characteristics of a project and various methodologies and frameworks used in IT projects.",
          "1.2 Compare and contrast Agile vs. Waterfall concepts.",
          "1.3 Given a scenario, apply the change control process throughout the project life cycle.",
          "1.4 Given a scenario, perform risk management activities.",
          "1.5 Given a scenario, perform issue management activities.",
          "1.6 Given a scenario, apply schedule development and management activities and techniques.",
          "1.7 Compare and contrast quality management concepts and performance management concepts.",
          "1.8 Compare and contrast communication management concepts.",
          "1.9 Given a scenario, apply effective meeting management techniques.",
          "1.10 Given a scenario, perform basic activities related to team and resource management.",
        ],
      },
      {
        title: "2.0 Project Life Cycle Phases",
        lessons: [
          "2.1 Explain the value of artifacts in the discovery/concept preparation phase for a project.",
          "2.2 Given a scenario, perform activities during the project initiation phase.",
          "2.3 Given a scenario, perform activities during the project planning phase.",
          "2.4 Given a scenario, perform activities during the project execution phase.",
        ],
      },
      {
        title: "3.0 Tools and Documentation",
        lessons: [
          "3.1 Given a scenario, use the appropriate tools throughout the project life cycle.",
          "3.2 Compare and contrast various project management productivity tools.",
          "3.3 Given a scenario, analyze quality and performance charts to inform project decisions.",
        ],
      },
      {
        title: "4.0 Basics of IT and Governance",
        lessons: [
          "4.1 Summarize basic environmental, social, and governance (ESG) factors related to project management activities.",
          "4.2 Explain relevant information security concepts impacting project management concepts.",
          "4.3 Explain relevant compliance and privacy considerations impacting project management.",
          "4.4 Summarize basic IT concepts relevant to IT project management.",
          "4.5 Explain operational change-control processes during an IT project.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-SERVER-SK0-005",
    title: "CompTIA Server+ (SK0-005)",
    sourcePath: "attached_assets/CompTIA_Server+_sk0-005_Exam_Objectives_1788280752631.pdf",
    resourceTitle: "Source PDF — CompTIA Server+ SK0-005 Exam Objectives",
    storageFilename: "comptia-server-plus-sk0-005-exam-objectives.pdf",
    description: "Official CompTIA Server+ exam objectives for server hardware, administration, security, disaster recovery, and troubleshooting.",
    modules: [
      {
        title: "1.0 Server Hardware Installation and Management",
        lessons: [
          "1.1 Given a scenario, install physical hardware.",
          "1.2 Given a scenario, deploy and manage storage.",
          "1.3 Given a scenario, perform server hardware maintenance.",
        ],
      },
      {
        title: "2.0 Server Administration",
        lessons: [
          "2.1 Given a scenario, install server operating systems.",
          "2.2 Given a scenario, configure servers to use network infrastructure services.",
          "2.3 Given a scenario, configure and maintain server functions and features.",
          "2.4 Explain the key concepts of high availability for servers.",
          "2.5 Summarize the purpose and operation of virtualization.",
          "2.6 Summarize scripting basics for server administration.",
          "2.7 Explain the importance of asset management and documentation.",
          "2.8 Explain licensing concepts.",
        ],
      },
      {
        title: "3.0 Security and Disaster Recovery",
        lessons: [
          "3.1 Summarize data security concepts.",
          "3.2 Summarize physical security concepts.",
          "3.3 Explain important concepts pertaining to identity and access management for server administration.",
          "3.4 Explain data security risks and mitigation strategies.",
          "3.5 Given a scenario, apply server hardening methods.",
          "3.6 Summarize proper server decommissioning concepts.",
          "3.7 Explain the importance of backups and restores.",
          "3.8 Explain the importance of disaster recovery.",
        ],
      },
      {
        title: "4.0 Troubleshooting",
        lessons: [
          "4.1 Explain the troubleshooting theory and methodology.",
          "4.2 Given a scenario, troubleshoot common hardware failures.",
          "4.3 Given a scenario, troubleshoot storage problems.",
          "4.4 Given a scenario, troubleshoot common OS and software problems.",
          "4.5 Given a scenario, troubleshoot network connectivity issues.",
          "4.6 Given a scenario, troubleshoot security problems.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-CYSA-CS0-003",
    title: "CompTIA Cybersecurity Analyst (CySA+) (CS0-003)",
    sourcePath: "attached_assets/comptia-cysa-cs0-003-exam-objectives-(4-0)_1788280752631.pdf",
    resourceTitle: "Source PDF — CompTIA Cybersecurity Analyst (CySA+) CS0-003 Exam Objectives",
    storageFilename: "comptia-cysa-plus-cs0-003-exam-objectives.pdf",
    description: "Official CompTIA CySA+ exam objectives for security operations, vulnerability management, incident response, reporting, and communication.",
    modules: [
      {
        title: "1.0 Security Operations",
        lessons: [
          "1.1 Explain the importance of system and network architecture concepts in security operations.",
          "1.2 Given a scenario, analyze indicators of potentially malicious activity.",
          "1.3 Given a scenario, use appropriate tools or techniques to determine malicious activity.",
          "1.4 Compare and contrast threat-intelligence and threat-hunting concepts.",
          "1.5 Explain the importance of efficiency and process improvement in security operations.",
        ],
      },
      {
        title: "2.0 Vulnerability Management",
        lessons: [
          "2.1 Given a scenario, implement vulnerability scanning methods and concepts.",
          "2.2 Given a scenario, analyze output from vulnerability assessment tools.",
          "2.3 Given a scenario, analyze data to prioritize vulnerabilities.",
          "2.4 Given a scenario, recommend controls to mitigate attacks and software vulnerabilities.",
          "2.5 Explain concepts related to vulnerability response, handling, and management.",
        ],
      },
      {
        title: "3.0 Incident Response and Management",
        lessons: [
          "3.1 Explain concepts related to attack methodology frameworks.",
          "3.2 Given a scenario, perform incident response activities.",
          "3.3 Explain the preparation and post-incident activity phases of the incident management life cycle.",
        ],
      },
      {
        title: "4.0 Reporting and Communication",
        lessons: [
          "4.1 Explain the importance of vulnerability management reporting and communication.",
          "4.2 Explain the importance of incident response reporting and communication.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-DATA-DA0-001",
    title: "CompTIA Data+ (DA0-001)",
    sourcePath: "attached_assets/comptia-data-da0-001-exam-objectives-(4-0)_1788280752632.pdf",
    resourceTitle: "Source PDF — CompTIA Data+ DA0-001 Exam Objectives",
    storageFilename: "comptia-data-plus-da0-001-exam-objectives.pdf",
    description: "Official CompTIA Data+ exam objectives for data concepts, mining, analysis, visualization, governance, quality, and controls.",
    modules: [
      {
        title: "1.0 Data Concepts and Environments",
        lessons: [
          "1.1 Identify basic concepts of data schemas and dimensions.",
          "1.2 Compare and contrast different data types.",
          "1.3 Compare and contrast common data structures and file formats.",
        ],
      },
      {
        title: "2.0 Data Mining",
        lessons: [
          "2.1 Explain data acquisition concepts.",
          "2.2 Identify common reasons for cleansing and profiling datasets.",
          "2.3 Given a scenario, execute data manipulation techniques.",
          "2.4 Explain common techniques for data manipulation and query optimization.",
        ],
      },
      {
        title: "3.0 Data Analysis",
        lessons: [
          "3.1 Given a scenario, apply the appropriate descriptive statistical methods.",
          "3.2 Explain the purpose of inferential statistical methods.",
          "3.3 Summarize types of analysis and key analysis techniques.",
          "3.4 Identify common data analytics tools.",
        ],
      },
      {
        title: "4.0 Visualization",
        lessons: [
          "4.1 Given a scenario, translate business requirements to form a report.",
          "4.2 Given a scenario, use appropriate design components for reports and dashboards.",
          "4.3 Given a scenario, use appropriate methods for dashboard development.",
          "4.4 Given a scenario, apply the appropriate type of visualization.",
          "4.5 Compare and contrast types of reports.",
        ],
      },
      {
        title: "5.0 Data Governance, Quality, and Controls",
        lessons: [
          "5.1 Summarize important data governance concepts.",
          "5.2 Given a scenario, apply data quality control concepts.",
          "5.3 Explain master data management (MDM) concepts.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-SECURITY-SY0-601",
    title: "CompTIA Security+ (SY0-601)",
    sourcePath: "attached_assets/comptia-security-sy0-601-exam-objectives-(6-0)_1788280752633.pdf",
    resourceTitle: "Source PDF — CompTIA Security+ SY0-601 Exam Objectives",
    storageFilename: "comptia-security-plus-sy0-601-exam-objectives.pdf",
    description: "Official CompTIA Security+ exam objectives for threats, architecture, implementation, operations, incident response, governance, risk, and compliance.",
    modules: [
      {
        title: "1.0 Threats, Attacks, and Vulnerabilities",
        lessons: [
          "1.1 Compare and contrast different types of social engineering techniques.",
          "1.2 Given a scenario, analyze potential indicators to determine the type of attack.",
          "1.3 Given a scenario, analyze potential indicators associated with application attacks.",
          "1.4 Given a scenario, analyze potential indicators associated with network attacks.",
          "1.5 Explain the security concerns associated with various types of vulnerabilities.",
          "1.6 Explain different threat actors, vectors, and intelligence sources.",
          "1.7 Explain the techniques used in penetration testing.",
          "1.8 Summarize the techniques used in security assessments.",
        ],
      },
      {
        title: "2.0 Architecture and Design",
        lessons: [
          "2.1 Explain the importance of security concepts in an enterprise environment.",
          "2.2 Summarize virtualization and cloud computing concepts.",
          "2.3 Summarize secure application development, deployment, and automation concepts.",
          "2.4 Summarize authentication and authorization design concepts.",
          "2.5 Given a scenario, implement cybersecurity resilience.",
          "2.6 Explain the security implications of embedded and specialized systems.",
          "2.7 Explain the importance of physical security controls.",
          "2.8 Summarize the basics of cryptographic concepts.",
        ],
      },
      {
        title: "3.0 Implementation",
        lessons: [
          "3.1 Given a scenario, implement secure protocols.",
          "3.2 Given a scenario, implement host or application security solutions.",
          "3.3 Given a scenario, implement secure network designs.",
          "3.4 Given a scenario, install and configure wireless security settings.",
          "3.5 Given a scenario, implement secure mobile solutions.",
          "3.6 Given a scenario, apply cybersecurity solutions to the cloud.",
          "3.7 Given a scenario, implement identity and access management.",
          "3.8 Given a scenario, implement authentication.",
          "3.9 Given a scenario, implement public key infrastructure.",
        ],
      },
      {
        title: "4.0 Operations and Incident Response",
        lessons: [
          "4.1 Given a scenario, use the appropriate tool to assess organizational security.",
          "4.2 Summarize the importance of policies, processes, and procedures for organizational security.",
          "4.3 Explain the key aspects of digital forensics.",
          "4.4 Given a scenario, apply incident response procedures.",
          "4.5 Given a scenario, use data sources to support an investigation.",
        ],
      },
      {
        title: "5.0 Governance, Risk, and Compliance",
        lessons: [
          "5.1 Compare and contrast various types of controls.",
          "5.2 Explain the importance of applicable regulations, standards, or frameworks that impact organizational security posture.",
          "5.3 Explain the importance of policies to organizational security.",
          "5.4 Summarize risk management processes and concepts.",
          "5.5 Explain privacy and sensitive data concepts in relation to security.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-SECURITYX-CAS-005",
    title: "CompTIA SecurityX (CAS-005)",
    sourcePath: "attached_assets/comptia-securityx-cas-005-exam-objectives-(3-0)1d9e61d00bce410_1788280752633.pdf",
    resourceTitle: "Source PDF — CompTIA SecurityX CAS-005 Exam Objectives",
    storageFilename: "comptia-securityx-cas-005-exam-objectives.pdf",
    description: "Official CompTIA SecurityX exam objectives for governance, risk, compliance, architecture, engineering, and security operations.",
    modules: [
      {
        title: "1.0 Governance, Risk and Compliance",
        lessons: [
          "1.1 Given a set of organizational security requirements, implement the appropriate governance, risk, and compliance controls.",
          "1.2 Given a set of organizational security requirements, perform risk analysis and management activities.",
          "1.3 Given a scenario, perform threat-modeling activities.",
          "1.4 Given a scenario, analyze requirements to design resilient systems.",
        ],
      },
      {
        title: "2.0 Security Architecture",
        lessons: [
          "2.1 Given a scenario, implement security in the early stages of the systems life cycle and throughout subsequent stages.",
          "2.2 Given a scenario, securely implement cloud capabilities in an enterprise environment.",
          "2.3 Given a scenario, integrate Zero Trust concepts into system architecture design.",
          "2.4 Given a scenario, troubleshoot common issues with identity and access management (IAM) components in an enterprise environment.",
          "2.5 Given a scenario, analyze requirements to enhance the security of endpoints and servers.",
          "2.6 Given a scenario, troubleshoot complex network infrastructure security issues.",
        ],
      },
      {
        title: "3.0 Security Engineering",
        lessons: [
          "3.1 Given a scenario, implement hardware security technologies and techniques.",
          "3.2 Given a set of requirements, secure specialized and legacy systems.",
          "3.3 Given a scenario, use automation to secure the enterprise.",
          "3.4 Explain the importance of advanced cryptographic concepts.",
          "3.5 Given a scenario, apply the appropriate cryptographic use case and/or technique.",
          "3.6 Given a scenario, analyze data to enable monitoring and response activities.",
          "3.7 Given a scenario, analyze vulnerabilities and attacks, and recommend solutions to reduce the attack surface.",
          "3.8 Given a scenario, apply threat-hunting and threat intelligence concepts.",
        ],
      },
      {
        title: "4.0 Security Operations",
        lessons: [
          "4.1 Given a scenario, analyze data and artifacts in support of incident response activities.",
          "4.2 Given a scenario, implement security operations processes.",
          "4.3 Given a scenario, apply incident response and recovery processes.",
          "4.4 Given a scenario, use appropriate security operations tools and technologies.",
        ],
      },
    ],
  },
  {
    code: "COMPTIA-TECH-FC0-U71",
    title: "CompTIA Tech+ (FC0-U71)",
    sourcePath: "attached_assets/comptia-tech-fc0-u71-exam-objectives-(2-0)_1788280752634.pdf",
    resourceTitle: "Source PDF — CompTIA Tech+ FC0-U71 Exam Objectives",
    storageFilename: "comptia-tech-plus-fc0-u71-exam-objectives.pdf",
    description: "Official CompTIA Tech+ exam objectives for IT concepts, infrastructure, applications, software development, data, databases, and security.",
    modules: [
      {
        title: "1.0 IT Concepts and Terminology",
        lessons: [
          "1.1 Identify notational systems.",
          "1.2 Explain the basics of computing.",
          "1.3 Compare and contrast common units of measure.",
          "1.4 Explain the troubleshooting methodology.",
        ],
      },
      {
        title: "2.0 Infrastructure",
        lessons: [
          "2.1 Explain common computing devices and their purposes.",
          "2.2 Explain the purpose of common internal computing components.",
          "2.3 Compare and contrast storage types.",
          "2.4 Given a scenario, install and configure common peripheral devices.",
          "2.5 Compare and contrast common types of input/output device interfaces.",
          "2.6 Compare and contrast virtualization and cloud technologies.",
          "2.7 Compare and contrast common internet service types.",
          "2.8 Identify basic networking concepts.",
          "2.9 Explain the basic capabilities of a small wireless network.",
        ],
      },
      {
        title: "3.0 Applications and Software",
        lessons: [
          "3.1 Identify components of an OS.",
          "3.2 Explain the purpose of operating systems.",
          "3.3 Explain the purpose and proper use of software.",
          "3.4 Given a scenario, configure and use web browser features.",
          "3.5 Identify common uses of artificial intelligence (AI).",
        ],
      },
      {
        title: "4.0 Software Development Concepts",
        lessons: [
          "4.1 Compare and contrast programming language categories.",
          "4.2 Identify fundamental data types and their characteristics.",
          "4.3 Explain the purpose and use of programming concepts.",
          "4.4 Identify programming organizational techniques and logic concepts.",
        ],
      },
      {
        title: "5.0 Data and Database Fundamentals",
        lessons: [
          "5.1 Explain the value of data and information.",
          "5.2 Explain database concepts and the purpose of a database.",
          "5.3 Compare and contrast various database structures.",
          "5.4 Explain basic data backup concepts.",
        ],
      },
      {
        title: "6.0 Security",
        lessons: [
          "6.1 Explain fundamental security concepts and frameworks.",
          "6.2 Explain methods to secure devices and security best practices.",
          "6.3 Explain password best practices.",
          "6.4 Identify common use cases for encryption.",
          "6.5 Given a scenario, configure security settings for a small wireless network.",
        ],
      },
    ],
  },
];

function assertEnvironment() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
}

function storagePathFor(storageKey) {
  const root = resolve(process.env.LMS_STORAGE_DIR || join(process.cwd(), "var", "lms-storage"));
  const destination = resolve(root, storageKey);
  if (destination !== root && !destination.startsWith(`${root}/`)) {
    throw new Error("Refusing to use a managed file path outside LMS storage.");
  }
  return destination;
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function findOrCreateProgramme(client, institution, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, name, code, description, status
     FROM programmes
     WHERE tenant_id = $1 AND institution_id = $2 AND code = $3
     FOR UPDATE`,
    [institution.tenant_id, institution.id, PROGRAMME_CODE],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].name !== PROGRAMME_NAME) {
      throw new Error(`Programme code ${PROGRAMME_CODE} already belongs to a different programme.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO programmes
      (tenant_id, institution_id, campus_id, name, code, description, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status`,
    [
      institution.tenant_id,
      institution.id,
      institution.campus_id ?? null,
      PROGRAMME_NAME,
      PROGRAMME_CODE,
      "CompTIA certification course catalogue.",
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateCourse(client, programme, definition, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status
     FROM courses
     WHERE tenant_id = $1 AND programme_id = $2 AND code = $3
     FOR UPDATE`,
    [programme.tenant_id, programme.id, definition.code],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) {
      throw new Error(`Course code ${definition.code} already belongs to a different course.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO courses
      (tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, $9)
     RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status`,
    [
      programme.tenant_id,
      programme.institution_id,
      programme.campus_id ?? null,
      programme.id,
      definition.title,
      definition.code,
      definition.description,
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateModule(client, course, definition, sequence, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, course_id, title, description, sequence, status
     FROM course_modules
     WHERE tenant_id = $1 AND course_id = $2 AND sequence = $3
     FOR UPDATE`,
    [course.tenant_id, course.id, sequence],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) {
      throw new Error(`Module sequence ${sequence} is already occupied by "${existing.rows[0].title}".`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO course_modules
      (tenant_id, course_id, title, description, sequence, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING id, tenant_id, course_id, title, description, sequence, status`,
    [
      course.tenant_id,
      course.id,
      definition.title,
      `CompTIA exam objective domain: ${definition.title}.`,
      sequence,
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateLesson(client, module, title, sequence, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, module_id, title, description, sequence, estimated_duration, status
     FROM lessons
     WHERE tenant_id = $1 AND module_id = $2 AND sequence = $3
     FOR UPDATE`,
    [module.tenant_id, module.id, sequence],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== title) {
      throw new Error(`Lesson sequence ${sequence} in "${module.title}" is already occupied by "${existing.rows[0].title}".`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO lessons
      (tenant_id, module_id, title, description, sequence, estimated_duration, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $7)
     RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
    [
      module.tenant_id,
      module.id,
      title,
      `CompTIA exam objective: ${title}`,
      sequence,
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateSourceResource(client, lesson, institution, definition, pdf, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status
     FROM learning_resources
     WHERE tenant_id = $1 AND lesson_id = $2 AND sequence = 1
     FOR UPDATE`,
    [lesson.tenant_id, lesson.id],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.resourceTitle || existing.rows[0].resource_type !== "PDF") {
      throw new Error(`Learning resource sequence 1 in "${lesson.title}" is already occupied by another resource.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO learning_resources
      (tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_by, updated_by)
     VALUES ($1, $2, 'PDF', $3, NULL, NULL, NULL, 1, $4, $5, $5)
     RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status`,
    [lesson.tenant_id, lesson.id, definition.resourceTitle, PUBLISHED, createdBy],
  );
  const resource = inserted.rows[0];
  const storageKey = `${lesson.tenant_id}/${resource.id}/${definition.storageFilename}`;
  const destination = storagePathFor(storageKey);
  const createdStorageFiles = [];

  if (await fileExists(destination)) {
    const current = await readFile(destination);
    const currentHash = createHash("sha256").update(current).digest("hex");
    if (currentHash !== pdf.sha256) throw new Error("The existing managed PDF path contains different content.");
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, pdf.buffer, { flag: "wx" });
    createdStorageFiles.push(destination);
  }

  try {
    await client.query(
      `INSERT INTO managed_files
        (tenant_id, institution_id, campus_id, resource_id, kind, storage_key, original_filename, mime_type, byte_size, sha256, entrypoint, created_by)
       VALUES ($1, $2, $3, $4, 'FILE', $5, $6, 'application/pdf', $7, $8, NULL, $9)`,
      [
        lesson.tenant_id,
        institution.id,
        institution.campus_id ?? null,
        resource.id,
        storageKey,
        pdf.filename,
        pdf.byteSize,
        pdf.sha256,
        createdBy,
      ],
    );
  } catch (error) {
    for (const createdPath of createdStorageFiles) await unlink(createdPath).catch(() => {});
    throw error;
  }
  return { row: resource, created: true };
}

async function importCourse(client, institution, programme, definition, actorId, counts) {
  const absolutePath = resolve(process.cwd(), definition.sourcePath);
  const buffer = await readFile(absolutePath);
  if (!buffer.length) throw new Error(`The source PDF is empty: ${definition.sourcePath}`);
  const pdf = {
    filename: basename(absolutePath),
    byteSize: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    buffer,
  };

  const course = await findOrCreateCourse(client, programme, definition, actorId);
  if (course.created) counts.coursesCreated += 1;
  let firstLesson = null;
  for (const [moduleIndex, moduleDefinition] of definition.modules.entries()) {
    const module = await findOrCreateModule(client, course.row, moduleDefinition, moduleIndex + 1, actorId);
    if (module.created) counts.modulesCreated += 1;
    for (const [lessonIndex, lessonTitle] of moduleDefinition.lessons.entries()) {
      const lesson = await findOrCreateLesson(client, module.row, lessonTitle, lessonIndex + 1, actorId);
      if (lesson.created) counts.lessonsCreated += 1;
      if (!firstLesson) firstLesson = lesson.row;
    }
  }
  if (!firstLesson) throw new Error(`Course ${definition.code} has no lessons for its source resource.`);
  const resource = await findOrCreateSourceResource(client, firstLesson, institution, definition, pdf, actorId);
  if (resource.created) counts.resourcesCreated += 1;
  return { row: course.row, sourceSha256: pdf.sha256 };
}

async function main() {
  assertEnvironment();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const counts = {
    programmesCreated: 0,
    coursesCreated: 0,
    modulesCreated: 0,
    lessonsCreated: 0,
    resourcesCreated: 0,
  };

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-comptia-objectives-courses"]);

      const institutionResult = process.env.INSTITUTION_ID
        ? await client.query(
          `SELECT id, tenant_id FROM institutions WHERE id = $1 AND status <> 'ARCHIVED'`,
          [process.env.INSTITUTION_ID],
        )
        : await client.query(
          `SELECT id, tenant_id FROM institutions WHERE status <> 'ARCHIVED' ORDER BY created_at ASC, id ASC`,
        );
      if (!institutionResult.rows[0]) throw new Error("No active institution is available for the import.");
      if (!process.env.INSTITUTION_ID && institutionResult.rows.length !== 1) {
        throw new Error("More than one active institution exists; set INSTITUTION_ID to choose the import scope.");
      }
      const institution = institutionResult.rows[0];

      const actorResult = await client.query(
        `SELECT u.id
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.tenant_id = $1 AND u.status <> 'ARCHIVED'
           AND r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
         ORDER BY u.created_at ASC, u.id ASC
         LIMIT 1`,
        [institution.tenant_id],
      );
      if (!actorResult.rows[0]) throw new Error("No active administrator actor exists in the current tenant.");
      const actorId = actorResult.rows[0].id;

      const programme = await findOrCreateProgramme(client, institution, actorId);
      if (programme.created) counts.programmesCreated += 1;
      const courses = [];
      for (const definition of COURSE_DEFINITIONS) {
        courses.push({
          definition,
          ...(await importCourse(client, institution, programme.row, definition, actorId, counts)),
        });
      }

      await client.query("COMMIT");
      console.log(JSON.stringify({
        status: PUBLISHED,
        counts,
        programmeId: programme.row.id,
        courses: courses.map(({ definition, row, sourceSha256 }) => ({
          code: definition.code,
          title: definition.title,
          courseId: row.id,
          source: definition.sourcePath,
          sourceSha256,
        })),
      }, null, 2));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`CompTIA objectives import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});