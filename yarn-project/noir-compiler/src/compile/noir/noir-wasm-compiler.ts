import { LogFn, createDebugLogger } from '@aztec/foundation/log';

import { compile } from '@noir-lang/noir_wasm';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { NoirCompilationArtifacts } from '../../noir_artifact.js';
import { NoirDependencyResolver } from './dependency-resolver.js';
import { Filemanager } from './filemanager.js';
import { NoirPackage } from './package.js';
import { initializeResolver } from './source-resolver.cjs';

/** Compilation options */
type NoirWasmCompileOptions = {
  /** Logging function */
  log?: LogFn;
};

/**
 * Noir Package Compiler
 */
export class NoirWasmContractCompiler {
  #projectPath: string;
  #log: LogFn;
  public constructor(projectPath: string, opts: NoirWasmCompileOptions) {
    this.#projectPath = projectPath;
    this.#log = opts.log ?? createDebugLogger('aztec:noir-compiler:wasm');
  }

  /**
   * Compiles the project.
   */
  public async compile(): Promise<NoirCompilationArtifacts[]> {
    const cacheRoot = process.env.XDG_CACHE_HOME ?? join(process.env.HOME ?? '', '.cache');
    const filemanager = new Filemanager(join(cacheRoot, 'noir_wasm'));

    const noirPackage = await NoirPackage.new(this.#projectPath, filemanager);
    if (noirPackage.getType() !== 'contract') {
      throw new Error('This is not a contract project');
    }

    this.#log(`Compiling contract at ${noirPackage.getEntryPointPath()}`);

    const dependencyResolver = new NoirDependencyResolver(filemanager);
    await dependencyResolver.recursivelyResolveDependencies(noirPackage);

    this.#log(`Dependencies: ${dependencyResolver.getPackageNames().join(', ')}`);

    initializeResolver((sourceId: any) => {
      try {
        const libFile = dependencyResolver.findFile(sourceId);
        return filemanager.readFileSync(libFile ?? sourceId, 'utf-8');
      } catch (err) {
        return '';
      }
    });

    /* eslint-disable camelcase */
    const res = await compile({
      entry_point: noirPackage.getEntryPointPath(),
      optional_dependencies_set: dependencyResolver.getPackageNames(),
      contracts: true,
    });
    /* eslint-enable camelcase */

    mkdirSync(join(this.#projectPath, 'target'), { recursive: true });
    writeFileSync(join(this.#projectPath, 'target', res.name + '.json'), JSON.stringify(res, null, 2));

    return [
      {
        contract: {
          backend: '',
          functions: res.functions,
          name: res.name,
        },
      },
    ];
  }
}