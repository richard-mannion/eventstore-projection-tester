import * as path from 'path';
export const getEnginePath = (rootPath: string, engineId: string) => {
    return path.join(rootPath, '.eventstore', engineId);
};
export const getProjectionFilePath = (enginePath: string, projectionName: string): string => {
    return path.join(enginePath, `${projectionName}.js`);
};
