import './Streamlit_mathlive.css'
import React from 'react'
import {Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib"

const getTex = (value, upright) => (upright ? `\\mathrm{${value}}` : value)

const renderPreviewHtml = (value, upright) => {
  const mathjax = typeof window !== 'undefined' ? window.MathJax : undefined
  const tex = getTex(value, upright)

  if (mathjax && typeof mathjax.tex2chtml === 'function') {
    const node = mathjax.tex2chtml(tex, { em: 14, ex: 7, display: true })
    return node && typeof node.outerHTML === 'string' ? node.outerHTML : ''
  }

  if (mathjax && typeof mathjax.tex2mml === 'function') {
    return mathjax.tex2mml(tex, { em: 14, ex: 7, display: true })
  }

  return tex
}

const renderMathML = (value, upright) => {
  const mathjax = typeof window !== 'undefined' ? window.MathJax : undefined
  const tex = getTex(value, upright)

  if (mathjax && typeof mathjax.tex2mml === 'function') {
    return mathjax.tex2mml(tex, { em: 14, ex: 7, display: true })
  }

  return ''
}

// Use &#123; and &#125; to escape { and } in JSX

class Streamlit_mathlive extends StreamlitComponentBase {
  
  constructor(props) {
    super(props)
    this.mf = React.createRef()

    const tex = getTex(this.props.args['value'], this.props.args['upright'])
    const mathml = renderMathML(this.props.args['value'], this.props.args['upright'])
    const previewHtml = renderPreviewHtml(this.props.args['value'], this.props.args['upright'])

    this.state = {
      upright: this.props.args['upright'],
      value: this.props.args['value'],
      tex,
      mathml,
      previewHtml,
    }

	if (this.props.args['edit']){
	Streamlit.setComponentValue([this.state.tex,this.state.mathml])}
	this.edit = this.props.args['edit']
	Streamlit.setFrameHeight()
  }

  //   static getDerivedStateFromProps(props, state) {
  //   return {value: props.args["value"]};
  // }

  // const theme = renderData.theme
  // const style = {}
  //
  // // Maintain compatibility with older versions of Streamlit that don't send
  // // a theme object.
  // if (theme) {
  //   // Use the theme object to style our button border. Alternatively, the
  //   // theme style is defined in CSS vars.
  //   const borderStyling = `1px solid ${isFocused ? theme.primaryColor : "gray"}`
  //   style.border = borderStyling
  //   style.outline = borderStyling
  // }

  // Customize the mathfield when it is mounted

  componentDidMount(){
    // Read more about customizing the mathfield: https://cortexjs.io/mathlive/guides/customizing/
	if (this.props.args['edit']) {
		this.mf.current.smartFence = true
		this.mf.current.mathVirtualKeyboardPolicy = "sandboxed";
    if (typeof window !== 'undefined' && window.mathVirtualKeyboard) {
      window.mathVirtualKeyboard.visible = true;
    }
		// This could be an `onInput` handler, but this is an alternative
		this.mf.current.addEventListener('input', (evt) => {
		  // When the return key is pressed, play a sound
		  if (evt.inputType === 'insertLineBreak') {
			// The mathfield is available as `evt.target`
			// The mathfield can be controlled with `executeCommand`
			// Read more: https://cortexjs.io/mathlive/guides/commands/
			evt.target.executeCommand('plonk')
		  }
		})
     }
  }

  change_val = (evt) => {
    const tex = getTex(evt.target.value, this.state.upright)
    const mathml = renderMathML(evt.target.value, this.state.upright)
    const previewHtml = renderPreviewHtml(evt.target.value, this.state.upright)

     this.setState(
      { value: evt.target.value, tex, mathml, previewHtml },
      () => Streamlit.setComponentValue([this.state.tex, this.state.mathml])
    )

    if(typeof window.MathJax !== "undefined"){
	    window.MathJax.typesetClear()
      window.MathJax.typeset()
    }
  }
  
  handle_check = () => {
    const upright = !this.state.upright
    const tex = getTex(this.state.value, upright)
    const mathml = renderMathML(this.state.value, upright)
    const previewHtml = renderPreviewHtml(this.state.value, upright)

	this.setState(
      {upright, tex, mathml, previewHtml},
      () => Streamlit.setComponentValue([this.state.tex, this.state.mathml])
    )
  }
  
	
  render() {
	if (this.props.args['edit']) {
    return (
        <div className='App'>
            <h2>{this.props.args['title']}</h2>
            <math-field ref={this.mf} onInput={(evt) => {
                this.change_val(evt)
            }}>
                {this.state.value}
            </math-field>

            <div class="form-check">
                <input class="form-check-input" type="checkbox" onChange={() => this.handle_check()}
                       checked={this.state.upright} id="upright1"/>
                <label class="form-check-label" for="upright1">
                    Upright equation
                </label>
            </div>
            <h4>{this.state.upright}</h4>
            {this.props.args['mathml_preview'] ? (
            <div>
            <h5>Render preview</h5>
            <h2 dangerouslySetInnerHTML={{__html: this.state.previewHtml || this.state.mathml || this.state.tex}}/>
            </div>):(<div></div>)}
            <break/>
        </div>
    )
    } else {
        return (<div></div>)
  }
  }
}

export default withStreamlitConnection(Streamlit_mathlive)
