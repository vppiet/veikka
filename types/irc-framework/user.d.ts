export default class User {
    nick: string;
    username: string;
    gecos: string;
    host: string;
    away: boolean;
    modes: Set<string>;
}
