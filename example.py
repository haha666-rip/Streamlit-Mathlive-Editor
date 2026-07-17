import streamlit as st
from st_mathlive import mathfield


st.title("ODE editor")

Tex, MathMl = mathfield("Equation", r"\frac{dy}{dx}=y(1-y)")


def initial_condition_inputs(order: int) -> list[float]:
    """Render inputs for y and its derivatives through order - 1."""
    values = []
    with st.container(border=True):
        st.subheader("Initial conditions")
        st.caption("Set the value of the solution and its derivatives at the starting point.")

        start_x = st.number_input(
            "Starting point (x₀)", value=0.0, key="initial_x"
        )
        for derivative_order in range(order):
            if derivative_order == 0:
                label = "y(x₀)"
            elif derivative_order == 1:
                label = "dy/dx (x₀)"
            else:
                label = f"d^{derivative_order}y/dx^{derivative_order} (x₀)"

            values.append(
                st.number_input(label, value=0.0, key=f"initial_y_{derivative_order}")
            )

    # Keep x₀ alongside the derivative values so the solve action can use it.
    st.session_state["ode_initial_conditions"] = {
        "x0": start_x,
        "values": values,
    }
    return values


ode_order = st.number_input(
    "ODE order",
    min_value=1,
    max_value=10,
    value=1,
    step=1,
    help="A differential equation of order n needs n initial values.",
)
initial_values = initial_condition_inputs(int(ode_order))
