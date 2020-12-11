from flask import Flask, request
import pandas as pd
import numpy as np
import pickle
from sklearn.base import BaseEstimator, TransformerMixin
from WoE import WoE_Binning

app = Flask(__name__)

@app.route('/credit_rating', methods=['GET', 'POST'])
def credit_rating():

    if request.method == 'POST':
        comment = request.json['data']
        comment = comment.split(",")
        comment = [i for i in comment]

        df_scorecard = pd.read_csv("https://raw.githubusercontent.com/skhiearth/Credit-Scorecard-API/main/data/scorecard.csv?token=AIZPUXK2F4WVIMYM5GNBFSS7VVNOC")
        X_test = pd.read_csv("https://raw.githubusercontent.com/skhiearth/Credit-Scorecard-API/main/data/data.csv?token=AIZPUXPEHH4POH6BD6TLXEK7VVOCI")
        print("Downloaded")

        print(len(comment))
        print(X_test.shape)

        X_test.loc[len(X_test)] = comment

        def emp_length_converter(df, column):
            df[column] = df[column].str.replace('\+ years', '')
            df[column] = df[column].str.replace('< 1 year', str(0))
            df[column] = df[column].str.replace(' years', '')
            df[column] = df[column].str.replace(' year', '')
            df[column] = pd.to_numeric(df[column])
            df[column].fillna(value=0, inplace=True)

        def date_columns(df, column):
            # store current month
            today_date = pd.to_datetime('2020-08-01')
            # convert to datetime format
            df[column] = pd.to_datetime(df[column], format="%b-%y")
            # calculate the difference in months and add to a new column
            df['mths_since_' + column] = round(pd.to_numeric((today_date - df[column]) / np.timedelta64(1, 'M')))
            # make any resulting -ve values to be equal to the max date
            df['mths_since_' + column] = df['mths_since_' + column].apply(
                lambda x: df['mths_since_' + column].max() if x < 0 else x)
            # drop the original date column
            df.drop(columns=[column], inplace=True)

        def loan_term_converter(df, column):
            df[column] = pd.to_numeric(df[column].str.replace(' months', ''))

        def col_to_drop(df, columns_list):
            df.drop(columns=columns_list, inplace=True)

        def dummy_creation(df, columns_list):
            df_dummies = []
            for col in columns_list:
                df_dummies.append(pd.get_dummies(df[col], prefix=col, prefix_sep=':'))
            df_dummies = pd.concat(df_dummies, axis=1)
            df = pd.concat([df, df_dummies], axis=1)
            return df

        drop_columns_list = ['revol_bal',
             'installment',
             'loan_amnt',
             'funded_amnt',
             'pub_rec',
             'funded_amnt_inv',
             'open_acc',
             'collections_12_mths_ex_med',
             'mths_since_last_major_derog',
             'mths_since_last_delinq',
             'delinq_2yrs',
             'acc_now_delinq',
             'tot_coll_amt',
             'policy_code',
             'addr_state',
             'initial_list_status',
             'pymnt_plan',
             'application_type',
             'out_prncp_inv',
             'total_pymnt_inv']

        emp_length_converter(X_test, 'emp_length')
        date_columns(X_test, 'earliest_cr_line')
        date_columns(X_test, 'issue_d')
        date_columns(X_test, 'last_pymnt_d')
        date_columns(X_test, 'last_credit_pull_d')
        loan_term_converter(X_test, 'term')
        col_to_drop(X_test, drop_columns_list)
        X_test = dummy_creation(X_test, ['grade', 'home_ownership', 'verification_status', 'purpose'])
        # reindex the dummied test set variables to make sure all the feature columns in the train set are also available in the test set
        X_test = X_test.reindex(labels=X_test.columns, axis=1, fill_value=0)

        X_test = X_test.drop(['home_ownership:ANY', 'Unnamed: 0'], axis=1)

        with open('/Users/skhiearth/Desktop/Credit-Scorecard-API/transformer.pickle', 'rb') as handle:
            woe_transform = pickle.load(handle)


        # first create a transformed test set through our WoE_Binning custom class
        X_test_woe_transformed = woe_transform.fit_transform(X_test)
        # insert an Intercept column in its beginning to align with the # of rows in scorecard
        X_test_woe_transformed.insert(0, 'Intercept', 1)

        # get the list of our final scorecard scores
        scorecard_scores = df_scorecard['Score - Final']

        ref_categories = ['mths_since_last_credit_pull_d:>75', 'mths_since_issue_d:>122',
                          'mths_since_earliest_cr_line:>434', 'total_rev_hi_lim:>79,780',
                          'total_rec_int:>7,260', 'total_pymnt:>25,000', 'out_prncp:>15,437', 'revol_util:>1.0',
                          'inq_last_6mths:>4', 'dti:>35.191',
                          'annual_inc:>150K', 'int_rate:>20.281', 'term:60', 'purpose:major_purch__car__home_impr',
                          'verification_status:Not Verified',
                          'home_ownership:MORTGAGE', 'grade:G']

        # we can see that the test set has 17 less columns than the rows in scorecard due to the reference categories
        # since the reference categories will always be scored as 0 based on the scorecard, it is safe to add these categories to the end of test set with 0 values
        X_test_woe_transformed = pd.concat(
            [X_test_woe_transformed, pd.DataFrame(dict.fromkeys(ref_categories, [0] * len(X_test_woe_transformed)),
                                                  index=X_test_woe_transformed.index)], axis=1)
        # Need to reshape scorecard_scores so that it is (102,1) to allow for matrix dot multiplication
        scorecard_scores = scorecard_scores.values.reshape(102, 1)

        y_scores = X_test_woe_transformed.dot(scorecard_scores)
        print(y_scores.head())

        scores = pd.read_csv("https://raw.githubusercontent.com/skhiearth/Credit-Scorecard-API/main/data/scores.csv?token=AIZPUXOJGNQLOSS66DGDAS27VWCVA")
        score = scores.sample()
        return "CryptoFinance"

        # if request.method == 'POST':
        #     symbol = request.args.get("Symbol")
        #
        #     cluster = df.loc[df['Symbol'] == symbol].Cluster.values
        #     df_to_send = df.loc[df['Cluster'] == cluster[0]]
        #
        #     return df_to_send['Symbol'].to_json()

    if request.method == 'GET':
        scores = pd.read_csv(
            "https://raw.githubusercontent.com/skhiearth/Credit-Scorecard-API/main/data/scores.csv?token=AIZPUXOJGNQLOSS66DGDAS27VWCVA")
        score = scores.sample()
        return score["0"].to_json()

if __name__ == '__main__':
    app.run()
