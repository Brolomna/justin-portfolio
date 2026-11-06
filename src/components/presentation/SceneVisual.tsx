import type { SceneId } from '@/data/scenes';
import IdentityVisual from '@/components/presentation/visuals/IdentityVisual';
import PythonVisual from '@/components/presentation/visuals/PythonVisual';
import AIVisual from '@/components/presentation/visuals/AIVisual';
import LinuxVisual from '@/components/presentation/visuals/LinuxVisual';
import SecurityVisual from '@/components/presentation/visuals/SecurityVisual';
import WebDevVisual from '@/components/presentation/visuals/WebDevVisual';
import ProjectsVisual from '@/components/presentation/visuals/ProjectsVisual';
import TeachingVisual from '@/components/presentation/visuals/TeachingVisual';
import ClosingVisual from '@/components/presentation/visuals/ClosingVisual';

export default function SceneVisual({ id }: { id: SceneId }) {
  switch (id) {
    case 'identity':
      return <IdentityVisual />;
    case 'python':
      return <PythonVisual />;
    case 'ai':
      return <AIVisual />;
    case 'linux':
      return <LinuxVisual />;
    case 'security':
      return <SecurityVisual />;
    case 'webdev':
      return <WebDevVisual />;
    case 'projects':
      return <ProjectsVisual />;
    case 'teaching':
      return <TeachingVisual />;
    case 'closing':
      return <ClosingVisual />;
  }
}
