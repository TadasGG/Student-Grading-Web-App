import "../styles/components.css";

export default function PageTitle({ title, className }) {
    return (
        <div className={className}>
            <h1>{title}</h1>
        </div>
    );
}