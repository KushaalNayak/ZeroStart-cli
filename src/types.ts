
export enum ProjectLanguage {
    NodeJS = 'Node.js',
    React = 'React',
    HTMLCSS = 'HTML/CSS',
    Python = 'Python',
    Java = 'Java',
    CPP = 'C++'
}

export enum ProjectType {
    WebApp = 'Web App',
    CLITool = 'CLI Tool',
    DSAPractice = 'DSA Practice',
    MLProject = 'ML Project'
}

export interface ProjectConfig {
    name: string;
    language: ProjectLanguage;
    type: ProjectType;
    isTheRepoPublic: boolean; // Renamed to clearly indicate boolean flag
    description: string;
    path: string;
}
