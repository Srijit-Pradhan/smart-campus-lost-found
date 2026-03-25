import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bot, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth(); // If they are logged in, we can change the CTA

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: <Bot className="w-8 h-8 text-primary-500" />,
      title: "AI Match Detection",
      description: "Our system uses advanced AI to automatically match photos of found items with lost item descriptions."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Real-time Alerts",
      description: "Get notified instantly when someone reports an item that matches what you've lost."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      title: "Secure Claims",
      description: "Built-in chat and trust scores ensure you return items to their rightful owners safely."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
      
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center max-w-4xl px-4 mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-primary">
          Lost Something? <br /> Let AI Find It.
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          The smart campus recovery platform that uses computer vision and semantic text matching to reunite you with your belongings.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to={user ? "/report-lost" : "/signup"} 
            className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            I Lost an Item
            <Search className="w-5 h-5" />
          </Link>
          <Link 
            to={user ? "/report-found" : "/signup"}
            className="px-8 py-4 glass text-foreground rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all transform hover:-translate-y-1"
          >
            I Found an Item
          </Link>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-3 gap-8 max-w-6xl w-full px-4"
      >
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            variants={fadeIn}
            className="glass-card p-8 flex flex-col items-center text-center group"
          >
            <div className="mb-6 p-4 rounded-2xl bg-secondary group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Demo Section (Optional / Teaser) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-24 w-full max-w-4xl glass p-2 rounded-3xl"
      >
        <div className="relative overflow-hidden rounded-2xl shadow-2xl min-h-[260px] sm:min-h-[320px] flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
          <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative text-center max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs font-semibold tracking-wide text-cyan-200">
              AI PREVIEW
            </div>
            <Bot className="w-12 h-12 text-cyan-300 mx-auto mb-4 animate-pulse" />
            <h4 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">Automated Matching Engine</h4>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              MobileNet image features and semantic text signals are combined into one confidence score for faster, more accurate match suggestions.
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Landing;
