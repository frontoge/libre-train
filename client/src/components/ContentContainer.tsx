
export function ContentContainer({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            margin: "2rem"
        }}>
            {children}
        </div>
    )
}