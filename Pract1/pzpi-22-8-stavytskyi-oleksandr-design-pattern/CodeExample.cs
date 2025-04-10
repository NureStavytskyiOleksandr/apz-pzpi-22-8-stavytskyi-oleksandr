public interface IMediator
{
    void Notify(Component sender, string eventName);
}
public class Component
{
    protected IMediator mediator;

    public void SetMediator(IMediator mediator)
    {
        this.mediator = mediator;
    }
}
public class ComponentA : Component
{
    public void DoA()
    {
        Console.WriteLine("ComponentA виконує A");
        mediator.Notify(this, "A");
    }
}

public class ComponentB : Component
{
    public void DoB()
    {
        Console.WriteLine("ComponentB виконує B");
        mediator.Notify(this, "B");
    }
}
public class ConcreteMediator : IMediator
{
    private ComponentA componentA;
    private ComponentB componentB;

    public ConcreteMediator(ComponentA a, ComponentB b)
    {
        componentA = a;
        componentB = b;

        componentA.SetMediator(this);
        componentB.SetMediator(this);
    }

    public void Notify(Component sender, string eventName)
    {
        if (eventName == "A")
        {
            Console.WriteLine("Посередник реагує на A і викликає B");
            componentB.DoB();
        }
        else if (eventName == "B")
        {
            Console.WriteLine("Посередник реагує на B і викликає A");
            componentA.DoA();
        }
    }
}
class Program
{
    static void Main(string[] args)
    {
        ComponentA a = new ComponentA();
        ComponentB b = new ComponentB();

        ConcreteMediator mediator = new ConcreteMediator(a, b);

        a.DoA();
        Console.WriteLine("-----");
        b.DoB();
    }
}
