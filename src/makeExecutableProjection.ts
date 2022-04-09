import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { getProjectionFilePath } from './paths';
export const makeExecutableProjection = (enginePath: string, projectionName: string, sourceFunction: string): void => {
    const executableProjection = wrapExecutableProjection(sourceFunction);
    const destinationFileName = getProjectionFilePath(enginePath, projectionName);
    if (!existsSync(enginePath)) {
        mkdirSync(enginePath, { recursive: true });
    }
    writeFileSync(destinationFileName, executableProjection);
};

export const wrapExecutableProjection = (sourceFunction: string): string => {
    return `export const executableProjection = (projection, emit, linkTo) => {
  return projection.${sourceFunction}
};`;
};
