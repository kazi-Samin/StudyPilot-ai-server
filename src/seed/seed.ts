import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { StudyPlan } from '../models/StudyPlan';
import { Review } from '../models/Review';

dotenv.config();

const studyPlansData = [
  {
    title: 'Calculus Fundamentals: From Limits to Integration',
    shortDescription: 'Build a rock-solid foundation in single-variable calculus with step-by-step problem solving.',
    fullDescription: 'Week 1: Limits and Continuity — Understand epsilon-delta definitions and limit laws.\nWeek 2: Derivatives — Master differentiation rules, chain rule, and implicit differentiation.\nWeek 3: Applications of Derivatives — Optimization, related rates, and curve sketching.\nWeek 4: Integrals — Definite and indefinite integrals, Fundamental Theorem of Calculus.\nWeek 5: Techniques of Integration — Substitution, integration by parts, and partial fractions.\nWeek 6: Review and Problem Sets — Comprehensive practice with exam-style questions.',
    subject: 'Mathematics', difficulty: 'Beginner', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    topics: ['Limits', 'Derivatives', 'Chain Rule', 'Integration', 'Fundamental Theorem']
  },
  {
    title: 'Linear Algebra for Data Science',
    shortDescription: 'Learn vectors, matrices, and transformations essential for machine learning and AI.',
    fullDescription: 'Week 1-2: Vectors, dot products, and linear combinations.\nWeek 3-4: Matrix operations, inverses, and determinants.\nWeek 5-6: Eigenvalues, eigenvectors, and SVD.\nWeek 7-8: Applications in PCA and data transformations.',
    subject: 'Mathematics', difficulty: 'Intermediate', duration: '8 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
    topics: ['Vectors', 'Matrices', 'Eigenvalues', 'SVD', 'PCA']
  },
  {
    title: 'Classical Mechanics: Newton to Lagrange',
    shortDescription: 'Master the laws of motion, energy conservation, and analytical mechanics.',
    fullDescription: 'Week 1: Kinematics and Newton\'s Laws.\nWeek 2: Work, energy, and conservation laws.\nWeek 3: Momentum, collisions, and rotational dynamics.\nWeek 4: Oscillations and wave motion.\nWeek 5: Lagrangian mechanics introduction.\nWeek 6: Problem-solving marathon and exam prep.',
    subject: 'Physics', difficulty: 'Intermediate', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800',
    topics: ['Newton\'s Laws', 'Energy Conservation', 'Rotational Dynamics', 'Lagrangian Mechanics']
  },
  {
    title: 'Quantum Physics Essentials',
    shortDescription: 'Explore wave-particle duality, Schrödinger equation, and quantum states.',
    fullDescription: 'Week 1: Historical overview and blackbody radiation.\nWeek 2: Wave-particle duality and the Bohr model.\nWeek 3: Schrödinger equation and wavefunctions.\nWeek 4: Quantum states, operators, and measurement.\nWeek 5: Hydrogen atom and angular momentum.\nWeek 6-7: Spin, entanglement, and modern applications.\nWeek 8: Review and conceptual problem sets.',
    subject: 'Physics', difficulty: 'Advanced', duration: '8 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    topics: ['Wave-Particle Duality', 'Schrödinger Equation', 'Quantum States', 'Entanglement']
  },
  {
    title: 'Full-Stack Web Development with React & Node.js',
    shortDescription: 'Build production-ready web applications from frontend to backend.',
    fullDescription: 'Week 1-2: HTML, CSS, JavaScript fundamentals and ES6+ features.\nWeek 3-4: React.js — Components, hooks, state management, routing.\nWeek 5-6: Node.js and Express — REST APIs, middleware, authentication.\nWeek 7-8: MongoDB and Mongoose — Data modeling and CRUD operations.\nWeek 9-10: Deployment, testing, and best practices.',
    subject: 'Computer Science', difficulty: 'Intermediate', duration: '10 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    topics: ['React.js', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication']
  },
  {
    title: 'Data Structures & Algorithms Mastery',
    shortDescription: 'Ace technical interviews with comprehensive DSA knowledge and practice.',
    fullDescription: 'Week 1: Arrays, strings, and hashing.\nWeek 2: Linked lists and stacks/queues.\nWeek 3: Trees and binary search trees.\nWeek 4: Graphs — BFS, DFS, shortest paths.\nWeek 5: Dynamic programming fundamentals.\nWeek 6: Advanced DP and greedy algorithms.\nWeek 7: Sorting, searching, and complexity analysis.\nWeek 8: Mock interviews and timed problem sets.',
    subject: 'Computer Science', difficulty: 'Advanced', duration: '8 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910auj9?w=800',
    topics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Big-O']
  },
  {
    title: 'Python for Beginners: Zero to Hero',
    shortDescription: 'Learn Python programming from scratch with hands-on projects and exercises.',
    fullDescription: 'Week 1: Installation, variables, data types, and basic I/O.\nWeek 2: Control flow — conditionals, loops, and functions.\nWeek 3: Data structures — lists, dictionaries, sets, tuples.\nWeek 4: File handling and error management.\nWeek 5: Object-oriented programming.\nWeek 6: Libraries, APIs, and mini-project.',
    subject: 'Computer Science', difficulty: 'Beginner', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    topics: ['Variables', 'Functions', 'OOP', 'Data Structures', 'File Handling']
  },
  {
    title: 'Molecular Biology: DNA to Protein',
    shortDescription: 'Understand the central dogma of molecular biology and gene expression.',
    fullDescription: 'Week 1: DNA structure, replication, and repair mechanisms.\nWeek 2: Transcription and RNA processing.\nWeek 3: Translation and protein folding.\nWeek 4: Gene regulation in prokaryotes and eukaryotes.\nWeek 5: Recombinant DNA technology and PCR.\nWeek 6: Genomics, proteomics, and CRISPR.',
    subject: 'Biology', difficulty: 'Intermediate', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800',
    topics: ['DNA Replication', 'Transcription', 'Translation', 'Gene Regulation', 'CRISPR']
  },
  {
    title: 'Human Anatomy & Physiology',
    shortDescription: 'A systematic study of the human body systems and their functions.',
    fullDescription: 'Week 1-2: Skeletal and muscular systems.\nWeek 3-4: Cardiovascular and respiratory systems.\nWeek 5-6: Nervous system and special senses.\nWeek 7-8: Digestive, endocrine, and reproductive systems.',
    subject: 'Biology', difficulty: 'Beginner', duration: '8 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    topics: ['Skeletal System', 'Cardiovascular', 'Nervous System', 'Endocrine', 'Digestion']
  },
  {
    title: 'World War II: Causes, Events & Aftermath',
    shortDescription: 'An in-depth analysis of the most devastating conflict in human history.',
    fullDescription: 'Week 1: Rise of fascism and the road to war.\nWeek 2: European theater — Blitzkrieg to Stalingrad.\nWeek 3: Pacific theater — Pearl Harbor to Midway.\nWeek 4: The Holocaust and wartime atrocities.\nWeek 5: D-Day, liberation, and the end of the war.\nWeek 6: Post-war order, Nuremberg trials, and the Cold War origins.',
    subject: 'History', difficulty: 'Intermediate', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800',
    topics: ['Fascism', 'European Theater', 'Pacific Theater', 'D-Day', 'Cold War Origins']
  },
  {
    title: 'Ancient Civilizations: Egypt, Greece & Rome',
    shortDescription: 'Explore the foundations of Western civilization from the Nile to the Tiber.',
    fullDescription: 'Week 1-2: Ancient Egypt — Pharaohs, pyramids, and hieroglyphics.\nWeek 3-4: Ancient Greece — Democracy, philosophy, and the arts.\nWeek 5-6: Roman Republic and Empire — Law, engineering, and expansion.\nWeek 7: Comparative analysis and legacy.',
    subject: 'History', difficulty: 'Beginner', duration: '7 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    topics: ['Ancient Egypt', 'Greek Democracy', 'Roman Empire', 'Philosophy', 'Architecture']
  },
  {
    title: 'Microeconomics: Markets & Decision Making',
    shortDescription: 'Understand supply and demand, market structures, and consumer behavior.',
    fullDescription: 'Week 1: Introduction to economics and the price mechanism.\nWeek 2: Supply, demand, and market equilibrium.\nWeek 3: Elasticity and consumer choice theory.\nWeek 4: Production costs and firm behavior.\nWeek 5: Market structures — perfect competition to monopoly.\nWeek 6: Market failures and government intervention.',
    subject: 'Economics', difficulty: 'Beginner', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    topics: ['Supply & Demand', 'Elasticity', 'Market Structures', 'Consumer Theory', 'Market Failure']
  },
  {
    title: 'Macroeconomics: GDP, Inflation & Fiscal Policy',
    shortDescription: 'Analyze national economies, monetary policy, and international trade dynamics.',
    fullDescription: 'Week 1: Measuring national output and GDP.\nWeek 2: Unemployment, inflation, and the business cycle.\nWeek 3: Aggregate demand and supply models.\nWeek 4: Fiscal policy and government budgets.\nWeek 5: Monetary policy and central banking.\nWeek 6: International trade and exchange rates.\nWeek 7: Review with case studies and data analysis.',
    subject: 'Economics', difficulty: 'Intermediate', duration: '7 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    topics: ['GDP', 'Inflation', 'Fiscal Policy', 'Monetary Policy', 'International Trade']
  },
  {
    title: 'Cognitive Psychology: How the Mind Works',
    shortDescription: 'Explore perception, memory, attention, and decision-making processes.',
    fullDescription: 'Week 1: History of cognitive psychology and research methods.\nWeek 2: Perception and attention mechanisms.\nWeek 3: Memory — encoding, storage, and retrieval.\nWeek 4: Language processing and comprehension.\nWeek 5: Problem solving and decision making.\nWeek 6: Cognitive development and neuropsychology.\nWeek 7: Applied cognitive psychology and current research.',
    subject: 'Psychology', difficulty: 'Intermediate', duration: '7 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800',
    topics: ['Perception', 'Memory', 'Attention', 'Decision Making', 'Language Processing']
  },
  {
    title: 'Introduction to Psychology',
    shortDescription: 'A broad survey of psychological science covering major theories and applications.',
    fullDescription: 'Week 1: What is psychology? History and approaches.\nWeek 2: Biological basis of behavior.\nWeek 3: Sensation, perception, and consciousness.\nWeek 4: Learning and conditioning.\nWeek 5: Personality theories.\nWeek 6: Social psychology and group behavior.',
    subject: 'Psychology', difficulty: 'Beginner', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    topics: ['Behavioral Psychology', 'Personality', 'Social Psychology', 'Learning', 'Consciousness']
  },
  {
    title: 'Shakespeare: Tragedies & Sonnets',
    shortDescription: 'A close reading of Shakespeare\'s greatest tragedies and his sonnet cycle.',
    fullDescription: 'Week 1: Shakespeare\'s world — Elizabethan theater and context.\nWeek 2: Hamlet — Indecision, revenge, and madness.\nWeek 3: Macbeth — Ambition, guilt, and the supernatural.\nWeek 4: Othello — Jealousy, manipulation, and race.\nWeek 5: King Lear — Power, family, and madness.\nWeek 6: The Sonnets — Love, time, and beauty.',
    subject: 'Literature', difficulty: 'Intermediate', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    topics: ['Hamlet', 'Macbeth', 'Othello', 'King Lear', 'Sonnets', 'Elizabethan Theater']
  },
  {
    title: 'Modern American Literature: 1920-Present',
    shortDescription: 'Survey the major movements and authors that shaped American literary culture.',
    fullDescription: 'Week 1: The Lost Generation — Fitzgerald and Hemingway.\nWeek 2: The Harlem Renaissance — Hughes and Hurston.\nWeek 3: Post-WWII fiction — Salinger, Vonnegut, and Kerouac.\nWeek 4: Civil Rights era literature — Baldwin and Morrison.\nWeek 5: Postmodern fiction — DeLillo and Pynchon.\nWeek 6: Contemporary voices and the future of American lit.',
    subject: 'Literature', difficulty: 'Advanced', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
    topics: ['Lost Generation', 'Harlem Renaissance', 'Postmodernism', 'Civil Rights Literature']
  },
  {
    title: 'Machine Learning Foundations',
    shortDescription: 'Understand supervised and unsupervised learning algorithms from the ground up.',
    fullDescription: 'Week 1-2: Math foundations — Linear algebra and probability review.\nWeek 3-4: Supervised learning — Regression, classification, SVMs.\nWeek 5-6: Unsupervised learning — Clustering, dimensionality reduction.\nWeek 7-8: Neural networks introduction and deep learning basics.\nWeek 9-10: Model evaluation, tuning, and real-world projects.',
    subject: 'Computer Science', difficulty: 'Advanced', duration: '10 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
    topics: ['Regression', 'Classification', 'Clustering', 'Neural Networks', 'Model Evaluation']
  },
  {
    title: 'Probability & Statistics for Scientists',
    shortDescription: 'Master statistical thinking, hypothesis testing, and data analysis techniques.',
    fullDescription: 'Week 1: Descriptive statistics and data visualization.\nWeek 2: Probability theory and combinatorics.\nWeek 3: Random variables and distributions.\nWeek 4: Sampling distributions and the Central Limit Theorem.\nWeek 5: Hypothesis testing and confidence intervals.\nWeek 6: Regression analysis and correlation.\nWeek 7: ANOVA and non-parametric tests.',
    subject: 'Mathematics', difficulty: 'Advanced', duration: '7 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    topics: ['Probability', 'Distributions', 'Hypothesis Testing', 'Regression', 'ANOVA']
  },
  {
    title: 'Ecology & Environmental Science',
    shortDescription: 'Study ecosystems, biodiversity, and the science behind environmental challenges.',
    fullDescription: 'Week 1: Ecosystem structure and energy flow.\nWeek 2: Population ecology and dynamics.\nWeek 3: Community ecology and species interactions.\nWeek 4: Biodiversity and conservation biology.\nWeek 5: Climate change science and impacts.\nWeek 6: Sustainable development and policy.',
    subject: 'Biology', difficulty: 'Beginner', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    topics: ['Ecosystems', 'Population Ecology', 'Biodiversity', 'Climate Change', 'Conservation']
  },
  {
    title: 'Behavioral Economics: Mind & Markets',
    shortDescription: 'Discover how cognitive biases shape financial decisions and market outcomes.',
    fullDescription: 'Week 1: Traditional vs. behavioral economics.\nWeek 2: Heuristics and cognitive biases.\nWeek 3: Prospect theory and loss aversion.\nWeek 4: Nudge theory and choice architecture.\nWeek 5: Behavioral finance and market anomalies.\nWeek 6: Policy applications and ethical considerations.',
    subject: 'Economics', difficulty: 'Advanced', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    topics: ['Cognitive Biases', 'Prospect Theory', 'Nudge Theory', 'Behavioral Finance']
  },
  {
    title: 'The Renaissance: Art, Science & Revolution',
    shortDescription: 'Trace the cultural rebirth that transformed Europe from the 14th to 17th century.',
    fullDescription: 'Week 1: Origins of the Renaissance in Italy.\nWeek 2: Art — Da Vinci, Michelangelo, and Raphael.\nWeek 3: Scientific revolution — Galileo, Copernicus.\nWeek 4: Literature and philosophy — Machiavelli, Erasmus.\nWeek 5: The Reformation and its impact.\nWeek 6: Northern Renaissance and global diffusion.',
    subject: 'History', difficulty: 'Intermediate', duration: '6 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800',
    topics: ['Italian Renaissance', 'Da Vinci', 'Scientific Revolution', 'Reformation']
  }
];

const reviewComments = [
  'Incredibly well-structured. The pacing was perfect for my learning speed.',
  'This plan helped me ace my exam. The weekly breakdown is genius.',
  'The topics are well-organized and the difficulty progression is spot on.',
  'Great plan! I loved the practical exercises included in each week.',
  'Comprehensive and thorough. Would recommend to any serious student.',
  'The study schedule was realistic and helped me stay on track.',
  'Excellent resource. Clear explanations and great topic coverage.',
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studypilot');
    console.log('Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await StudyPlan.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data.');

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo1234', salt);
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@studypilot.com',
      password: hashedPassword,
    });
    console.log('Created demo user: demo@studypilot.com / demo1234');

    // Create study plans
    const plansToInsert = studyPlansData.map((plan) => ({
      ...plan,
      userId: demoUser._id,
      rating: 0,
      reviewCount: 0,
    }));
    const insertedPlans = await StudyPlan.insertMany(plansToInsert);
    console.log(`Inserted ${insertedPlans.length} study plans.`);

    // Add reviews (2-3 reviews per plan)
    for (const plan of insertedPlans) {
      const numReviews = Math.floor(Math.random() * 2) + 2; // 2 or 3
      let totalRating = 0;
      for (let i = 0; i < numReviews; i++) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
        totalRating += rating;
        await Review.create({
          studyPlanId: plan._id,
          userId: demoUser._id,
          rating,
          comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        });
      }
      const avgRating = Math.round((totalRating / numReviews) * 10) / 10;
      await StudyPlan.findByIdAndUpdate(plan._id, {
        rating: avgRating,
        reviewCount: numReviews,
      });
    }
    console.log('Added reviews and updated ratings.');

    console.log('\n✅ Database seeded successfully!');
    console.log(`   📚 ${insertedPlans.length} study plans`);
    console.log(`   👤 Demo user: demo@studypilot.com / demo1234`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
