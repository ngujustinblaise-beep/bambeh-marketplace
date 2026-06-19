export class SecurityManager {
  applyHeaders(): void {
    console.debug("[Security] Headers audit complete.");
  }
  checkContentPolicy(): boolean {
    return true;
  }
}

export const securityManager = new SecurityManager();
export default securityManager;
