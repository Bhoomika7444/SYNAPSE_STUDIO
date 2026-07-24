import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Layers, Wand2, ArrowRight } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <header className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Synapse Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="default">Get Started</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Creative Studio</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in">
              <span className="gradient-text">AI That Designs</span>
              <br />
              <span className="text-foreground">With You</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in delay-100">
              Sketch, upload, and describe. Watch as AI transforms your ideas into 
              polished designs, logos, 3D visuals, and animation frames.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-200">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="group">
                  Start Creating
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="glass" size="xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="mt-24 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="glass rounded-2xl p-2 max-w-5xl mx-auto shadow-2xl animate-scale-in delay-300">
              <div className="bg-card rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <Wand2 className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Your creative workspace awaits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-32 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transform Ideas Into Reality
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From rough sketches to polished designs in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Create Logos",
                description: "Transform concepts into professional brand logos",
                color: "text-primary",
              },
              {
                icon: Wand2,
                title: "Polish & Enhance",
                description: "Refine rough ideas into stunning visuals",
                color: "text-accent",
              },
              {
                icon: Layers,
                title: "3D Concepts",
                description: "Generate impressive 3D visualizations",
                color: "text-primary",
              },
              {
                icon: Zap,
                title: "Animation Frames",
                description: "Create dynamic animation-ready artwork",
                color: "text-accent",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Create?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Your sketch becomes a design. Your doodle becomes a 3D concept. 
            Your idea becomes reality.
          </p>
          <Link to="/auth?mode=signup">
            <Button variant="glow" size="xl" className="group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Synapse Studio</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Synapse Studio. AI-powered creativity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
