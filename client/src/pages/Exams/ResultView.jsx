import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import { Award, FileSpreadsheet, Percent, Bookmark } from 'lucide-react';

const ResultView = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.exams.getMyResults();
        setResults(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve grade transcript.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Compute Transcript Summaries
  let totalCredits = 0;
  let weightedGPA = 0;
  results.forEach(record => {
    const credit = record.course?.creditHours || 3;
    totalCredits += credit;
    weightedGPA += record.gpa * credit;
  });
  const cumulativeGPA = totalCredits > 0 ? (weightedGPA / totalCredits).toFixed(2) : '0.00';

  const tableColumns = [
    {
      header: 'Subject Code',
      accessor: 'course.courseCode',
      className: 'text-mono',
      render: (row, val) => <strong>{val}</strong>,
    },
    {
      header: 'Course Name',
      accessor: 'course.courseName',
    },
    {
      header: 'Examination',
      accessor: 'examination.examName',
    },
    {
      header: 'Credit Hours',
      accessor: 'course.creditHours',
      className: 'text-mono',
    },
    {
      header: 'Marks Obtained',
      accessor: 'marksObtained',
      className: 'text-mono',
      render: (row, val) => `${val} / ${row.examination?.maxMarks}`,
    },
    {
      header: 'Letter Grade',
      accessor: 'grade',
      render: (row, val) => (
        <span className={`badge badge-${val.startsWith('F') ? 'error' : 'success'}`}>
          {val}
        </span>
      ),
    },
    {
      header: 'GPA Point',
      accessor: 'gpa',
      className: 'text-mono',
      render: (row, val) => val.toFixed(2),
    },
  ];

  if (loading) {
    return <Skeleton variant="rect" height="400px" />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-desc">
          <h2>Academic Transcript</h2>
          <p className="page-description">Review your published examination transcripts, semester grade cards, and cumulative GPA records.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Transcript Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Cumulative GPA</span>
            <span className="stat-value text-mono" style={{ color: Number(cumulativeGPA) >= 3.0 ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {cumulativeGPA}
            </span>
          </div>
          <div className="stat-icon-box" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Award size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Credits Earned</span>
            <span className="stat-value text-mono">{totalCredits}</span>
          </div>
          <div className="stat-icon-box">
            <FileSpreadsheet size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Exams Completed</span>
            <span className="stat-value text-mono">{results.length}</span>
          </div>
          <div className="stat-icon-box">
            <Bookmark size={20} />
          </div>
        </div>
      </div>

      {/* Transcript Table Card */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <h3 className="dashboard-card-title" style={{ padding: '20px 24px', margin: 0 }}>
          Published Results Roster
        </h3>
        <Table columns={tableColumns} data={results} emptyMessage="No published exam results are currently linked to your profile." />
      </div>
    </div>
  );
};

export default ResultView;
