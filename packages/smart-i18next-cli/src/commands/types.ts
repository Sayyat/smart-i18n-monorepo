export interface ICommandProps {
	opts: { config?: string, verbose?: boolean },
}

export interface IReactOrCoreCommandProps extends ICommandProps {
	options: { react?: boolean; core?: boolean; },
}