class DotCommand {
    base: string;
    baseRegex: RegExp;
    params: Array<string>;

    constructor(base: string, params?: Array<string>) {
        this.base = base;
        this.baseRegex = new RegExp(`^${DotCommand.PREFIX}${this.base}`);
        this.params = params ? params : [];
    }

    getQualified(): string {
        return `${DotCommand.PREFIX}${this.base}`;
    }

    static PREFIX = '.';
}

export {DotCommand};
