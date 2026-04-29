import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import whirlpoolLogo from '../../assets/c1344ad5145e3dcee746b700b0a6ef41f0a04829.png';

const ALLOWED_EMAIL_DOMAIN = 'whirpool.com';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      setError(
        `Solo se permite el acceso con cuentas corporativas @${ALLOWED_EMAIL_DOMAIN}.`
      );
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-black">
      {/* Animated gradient background - Stripe style */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 153, 220, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/3 -right-1/4 w-[900px] h-[900px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 153, 220, 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -120, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/3 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.2) 0%, transparent 70%)',
            filter: 'blur(55px)',
          }}
        />

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Bienvenido a<br />
              <motion.span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #FFC107 0%, #0099DC 25%, #FFC107 50%, #0099DC 75%, #FFC107 100%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '200% 0%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                Whirlpool Learning
              </motion.span>
            </h1>
            <p className="text-xl text-gray-300 max-w-lg">
              Potencia el aprendizaje de tu equipo con experiencias de vanguardia. Transforma habilidades en éxito.
            </p>
          </motion.div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <div 
            className="rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-8 mx-auto flex items-center justify-center"
            >
              <img 
                src={whirlpoolLogo} 
                alt="Whirlpool Learning" 
                className="h-16 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Ingresa tus credenciales para continuar
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Label htmlFor="email" className="text-white mb-2 block font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={`tu.usuario@${ALLOWED_EMAIL_DOMAIN}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#0099DC] focus:ring-[#0099DC] h-12 rounded-xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Label htmlFor="password" className="text-white font-medium mb-2 block">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#0099DC] focus:ring-[#0099DC] h-12 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert 
                    variant="destructive"
                    className="bg-red-500/20 border-red-500/50 text-white"
                  >
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Button 
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-[#0099DC] to-[#0077B6] hover:from-[#0077B6] hover:to-[#005F8D] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-400 text-sm">
                Powered by <span className="text-white font-semibold">Nerius</span>
              </p>
            </motion.div>
          </div>

          {/* Mobile branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="lg:hidden mt-8 text-center"
          >
            <p className="text-gray-400">
              Transforma tu experiencia de aprendizaje hoy
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
