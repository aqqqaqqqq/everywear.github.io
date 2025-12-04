html body {
  font-family: 'Noto Sans', sans-serif;
  background-color: #fafafa;
}

/* head */
.head-section {
  padding-bottom: 1.5em;
}

.publisher {
  font-size: 1.1em;
  font-weight: bold;
  padding-bottom: 0.5em;
}

.author-block {
  display: inline-block;
}

.author-block a {
  color: hsl(204, 86%, 53%) !important;
}

.author-block a:hover {
  text-decoration: underline;
}

.eql-cntrb { 
  font-size: smaller;
}

.link-block {
  margin-top: 1em;
}


/* content */
.content-section {
  padding-top: 0em;
  padding-bottom: 1.5em;
}

.results-carousel {
  overflow: hidden;
}

.results-carousel .item {
  overflow: hidden;
  margin: 0 2em;
  padding-bottom: 2em;
}

.results-carousel video {
  margin: 0;
}

.slider-pagination .slider-page {
  background: #000000;
}

.bibtex-block pre code {
  white-space: pre-wrap;
}


.footer span {
  font-size: 0.9em;
  color: #000;
}



.bal-block {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-items: stretch;
  align-content: stretch;
  width: 100%;
  aspect-ratio: 16/9;
}


/* @media all and (max-width: 479px) {
  .mainSection {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: space-around;
      align-items: stretch;
      align-content: stretch;
      width: 100%;
      height: 700px;
      padding: 10px;
  }
  .bal-container {
      margin: 10px 0;
  }
}
