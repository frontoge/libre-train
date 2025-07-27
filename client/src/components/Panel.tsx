
type PanelProps = {
    style?: React.CSSProperties;
    id?: string;
    className?: string;
    children?: React.ReactNode;
}

export function Panel(props: PanelProps) {
    return (
        <div id={props.id} className={props.className} style={{
            background: '#141414',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            ...props.style
        }}>
            {props.children}
        </div>
    );
}